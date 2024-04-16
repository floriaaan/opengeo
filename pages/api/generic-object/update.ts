// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { getDifference } from "@/lib/models/generic-object";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { getUserMinimum } from "@/lib/user";
import { History } from "@/models";
import { GenericObject } from "@/models/GenericObject";
import { APIResult } from "@/types/api";
import { GenericField, GenericObject as GenericObjectType } from "@/types/generic-object";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = GenericObjectType;

/**
 * A function that handles requests to the Next.js API route for updating a generic object.
 *
 * @remarks The function takes two arguments: `req`, which is the request object, and `res`, which is the response object. The function retrieves the ID, data, type, and children of the generic object to update from the request body, and uses the `GenericObject.findOneAndUpdate` method to update the object in the database. The function returns a JSON object with the updated generic object as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @param req - The request object.
 * @param res - The response object.
 *
 * @returns A JSON object with the updated generic object as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 * @example
 * // PUT /api/genericObject/update?id=614f6f6f6f6f6f6f6f6f6f6f
 * // Request body: { "type": "MyObject", "dr": "DR Normandie", "data": [ ... ], "children": [ ... ] }
 * // Response: { "data": { "_id": "614f6f6f6f6f6f6f6f6f6f6f", "metadata": { "label": "MyObject", "entity": "DR Normandie", "created_at": "2021-09-25T12:00:00.000Z", "updated_at": "2021-09-25T12:00:00.000Z" }, "values": [ ... ], "children": [ ... ] }, "error": null }
 */
async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  const { _id, metadata, data, children } = req.body;

  const user = getSessionOrThrow(req);
  if (!user) throw new Error("You must be logged in to access this resource");

  const values = data.map((e: GenericField) => {
    if (e.type === "coordinates") {
      const value = e.value as [string, string];
      return { ...e, value: [Number(value[0]), Number(value[1])] };
    }
    return e;
  });

  try {
    const object = (await GenericObject.findOne({ _id })) as GenericObjectType;

    const isFromEntity = server_canHaveAccess(user, object.metadata.entity, 100);
    const isSuperAdmin = server_canHaveAccess(user, undefined, 1000);

    if (!isFromEntity && !isSuperAdmin) throw new Error("You are not allowed to update this object");

    const filteredChildren = { ...children };

    Object.keys(filteredChildren).forEach((key) => {
      if (filteredChildren[key].length === 0) delete filteredChildren[key];
    });

    const result = await GenericObject.findOneAndUpdate(
      { _id },
      {
        metadata: {
          ...object?.metadata,
          ...metadata,
          created_at: object?.metadata.created_at,
          created_by: object?.metadata.created_by,
          updated_at: new Date(),
          updated_by: getUserMinimum(user),
        },
        values,
        children: filteredChildren,
      },
      { returnDocument: "after" },
    );

    // If the object is correctly updated, create a history entry
    if (result) {
      const differences = getDifference(object, result, `GenericObject/${result._id.toString()}`);

      await History.create({
        metadata: {
          label: metadata.label,
          entity: object.metadata.entity,
          type: "update",
          created_at: new Date(),
          created_by: getUserMinimum(user),
        },
        values: [
          { label: "path", value: `GenericObject/${result._id.toString()}`, type: "string" },
          { label: "affectedCount", value: differences.length, type: "number" },
          { label: "affectedPaths", value: differences.map((d) => d.path), type: "array" },
        ],
      });
    }

    return res.status(200).json({ data: result, error: null });
  } catch (error) {
    return res.status(500).json({
      data: null,
      error: { message: (error as Error).message ?? "Une erreur est survenue lors de la mise à jour de l'objet." },
    });
  }
}
export default withDatabase(handler);
