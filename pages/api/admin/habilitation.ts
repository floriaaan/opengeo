import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { getEntityFromContact } from "@/lib/user";
import {
  Habilitation,
  HabilitationDemande,
  HabilitationDemandeDocument,
  HabilitationDocument,
} from "@/models/Habilitation";
import { APIResult } from "@/types/api";
import { NextApiRequest, NextApiResponse } from "next";

export type ResultGET = { actives: HabilitationDocument[]; demandes: HabilitationDemandeDocument[] };

export type RequestPUT = { _id: HabilitationDocument["_id"]; action: "accept" | "delete" };
export type ResultPUT = { habilitation: HabilitationDocument | null };

export type RequestDELETE = { _id: HabilitationDocument["_id"] };
export type ResultDELETE = { habilitation: HabilitationDocument | null };

async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<ResultPUT | ResultGET | ResultDELETE>>) {
  const user = getSessionOrThrow(req);
  const { cn, id } = user || {};

  const entity = getEntityFromContact(user);

  try {
    switch (req.method) {
      case "GET": {
        const haveMinimalAdminAccess = server_canHaveAccess(user, undefined, 100);
        const haveFullAdminAccess = server_canHaveAccess(user, undefined, 1000);
        if (!haveMinimalAdminAccess && !haveFullAdminAccess)
          throw new Error("You don't have permission to update this sub-object");

        let actives = [] as HabilitationDocument[];
        let demandes = [] as HabilitationDemandeDocument[];

        if (haveMinimalAdminAccess && !haveFullAdminAccess) {
          actives = (await Habilitation.find({ "user.entity": entity })) as HabilitationDocument[];
          demandes = (await HabilitationDemande.find({ "user.entity": entity })) as HabilitationDemandeDocument[];
        } else if (haveFullAdminAccess) {
          actives = (await Habilitation.find()) as HabilitationDocument[];
          demandes = (await HabilitationDemande.find()) as HabilitationDemandeDocument[];
        }

        return res.status(200).json({ data: { actives, demandes }, error: null });
      }
      case "PUT": {
        const { _id, action } = req.body as RequestPUT;
        const habilitationDemande = (await HabilitationDemande.findById(_id)) as HabilitationDemandeDocument;
        if (!habilitationDemande) throw new Error("HabilitationDemande not found");

        const haveAccess = server_canHaveAccess(user, habilitationDemande.user.entity, 100);
        if (!haveAccess) throw new Error("Access denied");

        switch (action) {
          case "accept": {
            const existingHabilitation = await Habilitation.findOne({
              "user.id": habilitationDemande.user.id,
            });

            const habilitation = !existingHabilitation
              ? await Habilitation.create({
                  user: habilitationDemande.user,
                  role: habilitationDemande.role,
                  validatedBy: { cn, id, entity },
                  validatedAt: new Date(),
                })
              : ((await Habilitation.findByIdAndUpdate(existingHabilitation._id, {
                  role: habilitationDemande.role,
                  validatedBy: { cn, id, entity },
                  validatedAt: new Date(),
                })) as HabilitationDocument);

            await HabilitationDemande.findByIdAndDelete(_id);

            return res.status(200).json({ data: { habilitation }, error: null });
          }
          case "delete": {
            await HabilitationDemande.findByIdAndDelete(_id);
            return res.status(200).json({ data: { habilitation: null }, error: null });
          }
          default:
            throw new Error("Action not allowed");
        }
      }
      case "DELETE": {
        const haveAccess = server_canHaveAccess(user, undefined, 1000);
        if (!haveAccess) throw new Error("Access denied");

        const { _id } = req.body as RequestDELETE;
        await Habilitation.findByIdAndDelete(_id);
        return res.status(200).json({ data: { habilitation: null }, error: null });
      }
      default:
        throw new Error("Method not allowed");
    }
  } catch (error) {
    log.error(error);
    res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la récupération des habilitations.",
      },
    });
  }
}
export default withDatabase(handler);
