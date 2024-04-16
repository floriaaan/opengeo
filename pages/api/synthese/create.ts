// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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
    case "POST": {
      try {
        const { metadata, children } = req.body as {
          metadata: Pick<SyntheseType["metadata"], "reference" | "label">;
          children: SyntheseType["children"];
        };

        const user = getSessionOrThrow(req);
        const entity = getEntityFromContact(user);
        if (!user) throw new Error("Vous devez être connecté pour accéder à cette ressource");
        const isFromEntity = server_canHaveAccess(user, undefined, 100);
        if (!isFromEntity) throw new Error("Vous n'êtes pas autorisé à créer cette fiche synthèse");

        const result = await Synthese.create({
          metadata: {
            ...metadata,
            entity,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: getUserMinimum(user),
            updated_by: getUserMinimum(user),
          },
          children,
        });

        // If the object is correctly inserted, create a history entry
        if (result)
          await History.create({
            metadata: {
              label: metadata.label,
              entity,
              type: "create",
              created_at: new Date(),
              created_by: getUserMinimum(user),
            },
            values: [
              { label: "path", value: `Synthese/${result._id.toString()}`, type: "string" },
              { label: "affectedCount", value: 1, type: "number" },
            ],
          });

        return res.status(201).json({ data: result, error: null });
      } catch (error) {
        log.error(error);
        return res.status(500).json({
          data: null,
          error: {
            message: (error as Error).message ?? "Une erreur est survenue lors de la création de la fiche synthèse.",
          },
        });
      }
    }
    default:
      return res
        .status(405)
        .setHeader("Allow", "POST")
        .json({ data: null, error: { message: "Méthode non autorisée" } });
  }
}
export default withDatabase(handler);
