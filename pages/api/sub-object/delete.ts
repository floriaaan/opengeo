import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { getUserMinimum } from "@/lib/user";
import { History } from "@/models";
import { SubObject, SubObjectDocument } from "@/models/SubObject";
import { APIResult } from "@/types/api";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = { success: true };

/**
 * A function that handles requests to the Next.js API route for deleting a sub-object.
 *
 * @remarks The function takes two arguments: `req`, which is the request object, and `res`, which is the response object. The function retrieves the ID of the sub-object to delete from the request body, and uses the `SubObject.findByIdAndDelete` method to delete the sub-object from the database. The function returns a JSON object with a `success` property set to `true` as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @param req - The request object.
 * @param res - The response object.
 *
 * @returns A JSON object with a `success` property set to `true` as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 */
async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  const _id = req.body.id as string;

  try {
    const user = getSessionOrThrow(req);

    const subObject = (await SubObject.findById(_id)) as SubObjectDocument;

    const haveAccess = server_canHaveAccess(user, subObject.metadata.entity, 100);
    if (!haveAccess) throw new Error("You don't have access to this resource");

    const result = await SubObject.findByIdAndDelete(_id, { returnDocument: "before" });

    if (result)
      await History.create({
        metadata: {
          label: subObject.metadata.label,
          entity: subObject.metadata.entity,
          type: "delete",
          created_at: new Date(),
          created_by: getUserMinimum(user),
        },
        values: [
          { label: "path", value: `SubObject/${subObject._id.toString()}`, type: "string" },
          { label: "affectedCount", value: 1, type: "number" },
        ],
      });

    return res.status(200).json({
      data: { success: true },
      error: null,
    });
  } catch (error) {
    log.error(error);
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la suppression du sous-objet.",
      },
    });
  }
}
export default withDatabase(handler);
