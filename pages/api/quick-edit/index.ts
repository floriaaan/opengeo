import { server_canHaveAccess } from "@/hooks/useHabilitation";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { GenericObject } from "@/models/GenericObject";
import { APIResult } from "@/types/api";
import { GenericObject as GenericObjectType } from "@/types/generic-object";
import { NextApiRequest, NextApiResponse } from "next";

export type Result = any;

/**
 * A function that handles POST requests to update or create multiple `GenericObject` documents in the database.
 *
 * @remarks The function first checks if the request method is "POST". If it is not, it returns a 400 error response. If it is, it maps over the array of `GenericObjectType` objects in the request body and updates the `metadata.updated_at` field to the current date. It then creates an array of MongoDB `updateOne` operations for each object and passes them to the `bulkWrite` method of the `GenericObject` model. The resulting `BulkWriteResult` is returned as a 200 response. If an error occurs, a 500 error response is returned with the error details.
 *
 * @param req The Next.js API request object.
 * @param res The Next.js API response object.
 *
 * @returns A `BulkWriteResult` object as a 200 response, or an error response with the error details.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) => {
  if (req.method !== "POST")
    return res
      .status(400)
      .setHeader("Allow", "POST")
      .json({
        data: null,
        error: { message: "Méthode non autorisée. Utilisez la méthode POST pour mettre à jour les objets." },
      });

  try {
    const user = getSessionOrThrow(req);
    const haveAccess = server_canHaveAccess(user, undefined, 100);
    if (!haveAccess) throw new Error("You don't have access to this resource");

    const objects = (req.body as GenericObjectType[]).map(({ metadata, ...rest }) => {
      return {
        metadata: {
          ...metadata,
          updated_at: new Date(),
        },
        ...rest,
      };
    });

    const result = await GenericObject.bulkWrite(
      objects.map((object) => ({
        updateOne: {
          filter: { _id: object._id },
          update: { $set: object },
          upsert: true,
        },
      })),
    );
    return res.status(200).json({
      data: result,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la mise à jour des objets.",
      },
    });
  }
};

export default withDatabase(handler);
