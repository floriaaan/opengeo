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

export type Result = {
  success: boolean;
};

async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  switch (req.method) {
    case "DELETE": {
      try {
        const { _id } = req.body as {
          _id: SyntheseType["_id"];
        };

        const user = getSessionOrThrow(req);
        const entity = getEntityFromContact(user);
        if (!user) throw new Error("Vous devez être connecté pour accéder à cette ressource");
        const isFromEntity = server_canHaveAccess(user, undefined, 100);
        if (!isFromEntity) throw new Error("Vous n'êtes pas autorisé à modifier cette fiche synthèse");

        const s = await Synthese.findById(_id);
        if (!s) throw new Error("La fiche synthèse n'existe pas");
        const result = await Synthese.deleteOne({ _id }, { returnDocument: "after" });

        // If the object is correctly updated, create a history entry
        if (result.deletedCount === 1)
          await History.create({
            metadata: {
              label: s.metadata.label,
              entity,
              type: "delete",
              created_at: new Date(),
              created_by: getUserMinimum(user),
            },
            values: [
              { label: "path", value: `Synthese/${_id.toString()}`, type: "string" },
              { label: "affectedCount", value: 1, type: "number" },
            ],
          });

        return res.status(201).json({
          data: {
            success: result.deletedCount === 1,
          },
          error: null,
        });
      } catch (error) {
        log.error(error);
        return res.status(500).json({
          data: null,
          error: {
            message: (error as Error).message ?? "Une erreur est survenue lors de la suppresion de la fiche synthèse.",
          },
        });
      }
    }
    default:
      return res
        .status(405)
        .setHeader("Allow", ["DELETE"])
        .json({ data: null, error: { message: "Méthode non autorisée" } });
  }
}
export default withDatabase(handler);
