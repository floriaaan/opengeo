// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { _get, _set } from "@/lib/deep-get-set";
import { getDifference } from "@/lib/models/generic-object";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { getEntityFromContact, getUserMinimum } from "@/lib/user";
import { GenericObject, GenericObjectDocument, History } from "@/models";
import { Suggestion, SuggestionDocument } from "@/models/Suggestion";
import { APIResult } from "@/types/api";
import { GenericObject as GenericObjectType } from "@/types/generic-object";
import type { NextApiRequest, NextApiResponse } from "next";

export type ResultGET = (SuggestionDocument & { original: GenericObjectDocument })[];
export type ResultPUT = {
  _id: string;
  action: "validate" | "reject";
  status: "deleted" | "updated" | "errored";
  object?: GenericObjectDocument;
};

async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<ResultGET | ResultPUT>>) {
  try {
    const user = getSessionOrThrow(req);
    const { cn, id } = user || {};
    if (!cn || !id) throw new Error("User not found");
    const entity = getEntityFromContact(user);
    const canHaveAccess = server_canHaveAccess(user, undefined, 100);
    if (!canHaveAccess) throw new Error("Access denied");

    switch (req.method) {
      case "GET": {
        const result = await Promise.all(
          (await Suggestion.find({ entity })).map(async (s) => {
            const object_id = s.path.toString().split(".")[0];
            return { ...s.toJSON(), original: (await GenericObject.findById(object_id))?.toJSON() };
          }),
        );

        return res.status(200).json({ data: result, error: null });
      }

      case "PUT": {
        const { _id, action } = req.body;
        if (!_id || !action) throw new Error("Missing parameters");
        const s = (await Suggestion.findById(_id)) as SuggestionDocument;

        if (!s) throw new Error("Suggestion not found");
        if (s.entity !== entity) throw new Error("Access denied");

        switch (action) {
          case "validate": {
            let suggestion = s.suggestion;
            const object = (await GenericObject.findById(s.path.toString().split(".")[0])) as GenericObjectDocument;
            if (!object) throw new Error("Object not found");
            const old = { ...object.toJSON() } as GenericObjectType;

            const path = s.path.toString().split(".").slice(1).join(".");

            if (!path) throw new Error("Path not found");

            if (_get(object, path) === s.suggestion) throw new Error("Suggestion already applied");
            if (_get(object, path) === undefined) throw new Error("Path not found");

            if (_get(object, path.replace(".value", ".type")) === "coordinates") {
              const [lat, lng] = s.suggestion.toString().split(",");
              if (isNaN(Number(lat)) || isNaN(Number(lng))) throw new Error("Invalid coordinates");

              suggestion = [lat, lng];
            }

            _set(object, path, suggestion);

            object.markModified(s.path.includes("children") ? "children" : "values");
            await object.save();
            const newObj = (await GenericObject.findById(object._id)) as GenericObjectDocument;

            if (newObj) {
              const differences = getDifference(
                old,
                newObj.toJSON() as GenericObjectType,
                `GenericObject/${old._id.toString()}`,
              );

              await History.create({
                metadata: {
                  label: `suggestion ${newObj.metadata.label}`,
                  entity: newObj.metadata.entity,
                  type: "update",
                  created_at: new Date(),
                  created_by: getUserMinimum(user),
                },
                values: [
                  { label: "path", value: `GenericObject/${old._id.toString()}`, type: "string" },
                  { label: "affectedCount", value: differences.length, type: "number" },
                  { label: "affectedPaths", value: differences.map((d) => d.path), type: "array" },
                ],
              });
            }

            // Delete the suggestion
            await Suggestion.findOneAndDelete({ _id });

            return res.status(200).json({
              data: { _id: _id.toString(), action: "validate", status: "updated", object: newObj },
              error: null,
            });
          }

          case "reject": {
            await Suggestion.findOneAndDelete({ _id });
            return res.status(200).json({
              data: { _id: _id.toString(), action: "reject", status: "deleted" },
              error: null,
            });
          }

          default:
            throw new Error("Unknown action");
        }
      }
    }
  } catch (error) {
    // log.error(error);
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la mise à jour de l'objet.",
      },
    });
  }
}
export default withDatabase(handler);
