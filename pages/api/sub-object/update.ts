import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import { getDifference } from "@/lib/models/sub-object";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { getUserMinimum } from "@/lib/user";
import { GenericObject, GenericObjectDocument, History } from "@/models";
import { SubObject, SubObjectDocument, SubObjectType } from "@/models/SubObject";
import { APIResult } from "@/types/api";
import { Field, GenericField, GenericObject as GenericObjectType } from "@/types/generic-object";
import { SubObjectMetadata } from "@/types/global";

import type { NextApiRequest, NextApiResponse } from "next";

export type Result = { document: SubObjectDocument; modifiedCount: number; affectedCount: number };

/**
 * A function that handles requests to the Next.js API route for updating a sub-object.
 *
 * @remarks The function takes two arguments: `req`, which is the request object, and `res`, which is the response object. The function retrieves the ID, data, label, and authorization of the sub-object to update from the request body, and uses the `SubObject.findOne` method to retrieve the sub-object from the database. The function then uses the `SubObject.findOneAndUpdate` method to update the sub-object in the database with the new metadata and values. The function returns a JSON object with the updated sub-object as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @param req - The request object.
 * @param res - The response object.
 *
 * @returns A JSON object with the updated sub-object as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 */
async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  const { metadata, data, _id } = req.body as { metadata: SubObjectMetadata; data: Field[]; _id: string };

  try {
    const user = getSessionOrThrow(req);
    if (!user) throw new Error("You must be logged in to access this resource");
    const isFromEntity = server_canHaveAccess(user, metadata.entity, 100);
    const isSuperAdmin = server_canHaveAccess(user, undefined, 1000);
    if (!isFromEntity && !isSuperAdmin) throw new Error("You don't have permission to update this sub-object");

    const old = (await SubObject.findById(_id)) as SubObjectDocument;
    if (!old) throw new Error(`No subobject matching id: ${_id}`);

    const label = metadata.label.toLocaleLowerCase().trim();

    const values: GenericField[] = data.map((e) => {
      let value: any;

      if (e.type === "string" || e.type === "url") value = "";
      else if (e.type === "number") value = 0;
      else if (e.type === "date") value = new Date();
      else if (e.type === "boolean") value = false;

      return { ...e, value };
    });

    const result = (await SubObject.findOneAndUpdate(
      { _id },
      {
        metadata: {
          ...old.metadata,
          label,
          authorization: metadata.authorization,
          entity: metadata.entity,
          description: metadata.description,

          updated_at: new Date(),
          updated_by: getUserMinimum(user),
        },
        values,
      },
      { returnDocument: "after" },
    )) as SubObjectDocument;
    if (!result) throw new Error("Sub-object not found");

    // #region update all objects that have this subobject
    // =================================================================================================
    // UPDATE ALL OBJECTS THAT HAVE THIS SUBOBJECT

    const allObjects = (await GenericObject.find({
      // "metadata.entity": metadata.entity,
    })) as GenericObjectDocument[];

    const affected_objects = allObjects.filter((object) => {
      // Iterate over all keys in the 'children' property
      for (const key in object.children) {
        // Check if the array for this key contains a subobject with the specified id
        if (object.children[key].some((subObject: SubObjectType) => subObject._id.toString() === _id.toString()))
          return true;
      }

      return false;
    });

    let modifiedCount = 0;
    let new_affected_objects = [] as GenericObjectType[];

    if (affected_objects.length !== 0) {
      new_affected_objects = affected_objects.map((o) => {
        const new_object = { ...o.toJSON() } as GenericObjectType;

        // Find the old key that contains the subobject with the specified id
        const old_key = Object.entries(new_object.children).find(([, value]) => {
          return value.some((c: GenericObjectType) => c._id.toString() === _id.toString());
        })?.[0];

        // If the old key is not found, return the object as is
        if (!old_key) return new_object;

        new_object.metadata.updated_at = new Date();
        new_object.children[label] = new_object.children[old_key].map((c: GenericObjectType) => {
          return {
            ...c,
            metadata: {
              ...c.metadata,
              label,
              authorization: metadata.authorization,
              entity: metadata.entity,
              description: metadata.description, // Add a default value for description
              updated_at: new Date(),
              updated_by: getUserMinimum(user) || undefined,
            },
            // TODO (maybe): change values to new values
            // TODO (maybe): we need to remove values that are not in the new subobject and add values that are not in the old subobject
            values: c.values,
          };
        });

        // Delete the old key from the object
        if (old_key !== label) delete new_object.children[old_key];

        return new_object;
      });

      // Update all affected objects
      const bulkWriteResult = await GenericObject.bulkWrite(
        new_affected_objects.map((o) => ({
          updateOne: {
            filter: { _id: o._id },
            update: { $set: o },
          },
        })),
      );
      modifiedCount = bulkWriteResult.modifiedCount;
    }
    // =================================================================================================
    // #endregion

    // If the object is correctly updated, create a history entry
    if (result) {
      const subobject_differences = getDifference(old, result, `SubObject/${result._id.toString()}`);
      const object_differences =
        affected_objects.length !== 0
          ? affected_objects.map((o) => {
              const new_object = new_affected_objects.find((n) => n._id.toString() === o._id.toString());
              if (!new_object) return [];
              return getDifference(o, new_object, `GenericObject/${o._id.toString()}`);
            })
          : [];

      const differences = [...subobject_differences, ...object_differences.flat()];

      await History.create({
        metadata: {
          label,
          entity: metadata.entity,
          type: "update",
          created_at: new Date(),
          created_by: getUserMinimum(user),
        },
        values: [
          { label: "path", value: `SubObject/${result._id.toString()}`, type: "string" },
          { label: "affectedCount", value: differences.length, type: "number" },
          { label: "affectedPaths", value: differences.map((d) => d.path), type: "array" },
        ],
      });
    }

    return res
      .status(200)
      .json({ data: { document: result, modifiedCount, affectedCount: affected_objects.length }, error: null });
  } catch (error) {
    log.error(error);
    return res.status(500).json({
      data: null,
      error: { message: (error as Error).message ?? "Une erreur est survenue lors de la mise à jour du sous-objet." },
    });
  }
}
export default withDatabase(handler);
