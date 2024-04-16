import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import {
  Habilitation,
  HabilitationDemande,
  HabilitationDemandeDocument,
  HabilitationDocument,
} from "@/models/Habilitation";
import { APIResult } from "@/types/api";
import { NextApiRequest, NextApiResponse } from "next";

export type ResultPOST = HabilitationDemandeDocument;
export type ResultGET = HabilitationDocument;

async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<ResultPOST | ResultGET>>) {
  try {
    switch (req.method) {
      case "GET": {
        const userCookies = req.cookies["opengeo-user"];
        if (!userCookies) throw new Error("User not found");
        const user = JSON.parse(userCookies);

        const result = (await Habilitation.findOne({ "user.id": user.id })) as HabilitationDocument;
        return res.status(200).json({ data: result, error: null });
      }
      case "POST": {
        const data = req.body as { user: { cn: string; id: string; entity: string }; role: string };

        if ([data.user, data.role].some((s) => !s))
          throw new Error(
            `Missing parameters: ${[!data.user ? "user" : "", !data.role ? "role" : ""]
              .filter((s) => s !== "")
              .join(", ")}`,
          );

        const existingHabilitationDemande = await HabilitationDemande.findOne({
          "user.id": data.user.id,
        });

        existingHabilitationDemande
          ? await HabilitationDemande.updateOne({ "user.id": data.user.id }, { role: data.role })
          : await HabilitationDemande.create({
              user: data.user,
              role: data.role,
            });

        const result = (await HabilitationDemande.findOne({
          "user.id": data.user.id,
        })) as HabilitationDemandeDocument;

        return res.status(201).json({ data: result, error: null });
      }
      default:
        throw new Error("Method not allowed");
    }
  } catch (error) {
    log.error(error);
    res.status(500).json({
      data: null,
      error: {
        message:
          (error as Error).message ?? "Une erreur est survenue lors de la création de la demande d'habilitation.",
      },
    });
  }
}
export default withDatabase(handler);
