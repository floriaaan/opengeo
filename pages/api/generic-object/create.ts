// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
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
 * A function that handles requests to the Next.js API route for creating a new generic object.
 *
 * @remarks The function takes two arguments: `req`, which is the request object, and `res`, which is the response object. The function retrieves the data and children from the request body, processes the data to convert coordinates to numbers, and inserts the new generic object into the database using the `GenericObject.create` method. The function returns a JSON object with the new generic object as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @param req - The request object.
 * @param res - The response object.
 *
 * @returns A JSON object with the new generic object as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @example
 * // POST /api/genericObject/create
 * // Request body: { "type": "MyObject", "dr": "DR Normandie", "data": [ ... ], "children": [ ... ] }
 * // Response: { "data": { "_id": "614f6f6f6f6f6f6f6f6f6f6f", "metadata": { "label": "MyObject", "entity": "DR Normandie", "created_at": "2021-09-25T12:00:00.000Z", "updated_at": "2021-09-25T12:00:00.000Z" }, "values": [ ... ], "children": [ ... ] }, "error": null }
 */
async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  try {
    const { metadata, data, children } = req.body;
    const { label, entity } = metadata;

    const user = getSessionOrThrow(req);
    if (!user) throw new Error("You must be logged in to access this resource");
    const isFromEntity = server_canHaveAccess(user, entity, 100);
    const isSuperAdmin = server_canHaveAccess(user, undefined, 1000);
    if (!isFromEntity && !isSuperAdmin) throw new Error("You are not allowed to create this object");

    const values = data.map((e: GenericField) => {
      if (e.type === "coordinates") {
        const value = e.value as [string, string];
        return { ...e, value: [Number(value[0]), Number(value[1])] };
      }
      return e;
    });

    const result = await GenericObject.create({
      metadata: {
        label,
        entity,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: getUserMinimum(user),
        updated_by: getUserMinimum(user),
      },
      values,
      children,
    });

    // If the object is correctly inserted, create a history entry
    if (result)
      await History.create({
        metadata: {
          label,
          entity,
          type: "create",
          created_at: new Date(),
          created_by: getUserMinimum(user),
        },
        values: [
          { label: "path", value: `GenericObject/${result._id.toString()}`, type: "string" },
          { label: "affectedCount", value: 1, type: "number" },
        ],
      });

    return res.status(201).json({ data: result, error: null });
  } catch (error) {
    log.error(error);
    return res.status(500).json({
      data: null,
      error: { message: (error as Error).message ?? "Une erreur est survenue lors de la création de l'objet." },
    });
  }
}
export default withDatabase(handler);
