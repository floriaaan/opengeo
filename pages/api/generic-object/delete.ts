import { server_canHaveAccess } from "@/hooks/useHabilitation";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { getUserMinimum } from "@/lib/user";
import { History } from "@/models";
import { GenericObject } from "@/models/GenericObject";
import { APIResult } from "@/types/api";
import { GenericObject as GenericObjectType } from "@/types/generic-object";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = {
  success: boolean;
};

/**
 * A function that handles requests to the Next.js API route for deleting a generic object.
 *
 * @remarks The function takes two arguments: `req`, which is the request object, and `res`, which is the response object. The function retrieves the ID of the generic object to delete from the request body, and uses the `GenericObject.findByIdAndDelete` method to delete the object from the database. The function returns a JSON object with a `success` property set to `true` as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @param req - The request object.
 * @param res - The response object.
 *
 * @returns A JSON object with a `success` property set to `true` as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @example
 * // DELETE /api/genericObject/delete
 * // Request body: { "id": "614f6f6f6f6f6f6f6f6f6f6f" }
 * // Response: { "data": { "success": true }, "error": null }
 */
async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  const _id = req.body.id as string;

  try {
    const user = getSessionOrThrow(req);
    if (!user) throw new Error("You must be logged in to access this resource");

    const object = (await GenericObject.findOne({ _id })) as GenericObjectType;
    if (!object) throw new Error("Object not found");

    const isFromEntity = server_canHaveAccess(user, object.metadata.entity, 100);
    const isSuperAdmin = server_canHaveAccess(user, undefined, 1000);

    if (!isFromEntity && !isSuperAdmin) throw new Error("You are not allowed to update this object");

    const result = await GenericObject.findByIdAndDelete(_id, { returnDocument: "before" });

    if (result)
      await History.create({
        metadata: {
          label: object.metadata.label,
          entity: object.metadata.entity,
          type: "delete",
          created_at: new Date(),
          created_by: getUserMinimum(user),
        },
        values: [
          { label: "path", value: `GenericObject/${object._id.toString()}`, type: "string" },
          { label: "affectedCount", value: 1, type: "number" },
        ],
      });

    return res.status(200).json({
      data: { success: true },
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      data: null,
      error: { message: (error as Error).message ?? "Une erreur est survenue lors de la suppression de l'objet." },
    });
  }
}
export default withDatabase(handler);
