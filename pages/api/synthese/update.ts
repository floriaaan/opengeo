import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { getEntityFromContact, getUserMinimum } from "@/lib/user";
import { History } from "@/models";
import { Synthese } from "@/models/Synthese";
import { APIResult } from "@/types/api";
import { SyntheseType } from "@/types/synthese";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = SyntheseType;

async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  switch (req.method) {
    case "PUT": {
      try {
        const { metadata, children, _id } = req.body as {
          metadata: Pick<SyntheseType["metadata"], "reference" | "label">;
          children: SyntheseType["children"];
          _id: SyntheseType["_id"];
        };

        const user = getSessionOrThrow(req);
        const entity = getEntityFromContact(user);
        if (!user) throw new Error("Vous devez être connecté pour accéder à cette ressource");
        const isFromEntity = server_canHaveAccess(user, undefined, 100);
        if (!isFromEntity) throw new Error("Vous n'êtes pas autorisé à modifier cette fiche synthèse");

        let s = await Synthese.findById(_id);
        if (!s) throw new Error("La fiche synthèse n'existe pas");

        const result = await Synthese.updateOne(
          { _id },
          {
            $set: {
              metadata: {
                ...metadata,
                entity,
                updated_at: new Date(),
                updated_by: getUserMinimum(user),
              },
              children,
            },
          },
          { returnDocument: "after" },
        );

        s = await Synthese.findById(_id);

        // If the object is correctly updated, create a history entry
        if (result.modifiedCount === 1)
          await History.create({
            metadata: {
              label: metadata.label,
              entity,
              type: "update",
              created_at: new Date(),
              created_by: getUserMinimum(user),
            },
            values: [
              { label: "path", value: `Synthese/${_id.toString()}`, type: "string" },
              { label: "affectedCount", value: 1, type: "number" },
            ],
          });

        return res.status(201).json({ data: s, error: null });
      } catch (error) {
        log.error(error);
        return res.status(500).json({
          data: null,
          error: {
            message: (error as Error).message ?? "Une erreur est survenue lors de la mise à jour de la fiche synthèse.",
          },
        });
      }
    }
    default:
      return res
        .status(405)
        .setHeader("Allow", ["PUT"])
        .json({ data: null, error: { message: "Méthode non autorisée" } });
  }
}
export default withDatabase(handler);
