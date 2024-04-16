import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { getDifference } from "@/lib/models/generic-object";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { getUserMinimum } from "@/lib/user";
import { GenericObject, GenericObjectDocument, History } from "@/models";
import { SubObject } from "@/models/SubObject";
import { APIResult } from "@/types/api";
import { Field, GenericField, GenericObject as GenericObjectType } from "@/types/generic-object";
import { SubObjectMetadata } from "@/types/global";
import { SubObjectFlags } from "@/types/sub-object";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = GenericObjectType;

/**
 * A function that handles requests to the Next.js API route for creating a new sub-object.
 *
 * @remarks The function takes two arguments: `req`, which is the request object, and `res`, which is the response object. The function retrieves the type, data, and authorization of the sub-object to create from the request body, and uses the `SubObject.create` method to insert the sub-object into the database. The function returns a JSON object with the created sub-object as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @param req - The request object.
 * @param res - The response object.
 *
 * @returns A JSON object with the created sub-object as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 */
async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<GenericObjectType>>) {
  const { metadata, data, flags } = req.body as { metadata: SubObjectMetadata; data: Field[]; flags?: SubObjectFlags };
  const label = metadata.label.toLocaleLowerCase().trim();
  const entity = metadata.entity;

  if (!label || !entity)
    return res.status(400).json({
      data: null,
      error: { message: "Le nom et l'entité du sous-objet sont requis pour le traitement." },
    });

  const { autoLink } = flags ?? { autoLink: false };

  try {
    const user = getSessionOrThrow(req);
    if (!user) throw new Error("You must be logged in to access this resource");

    const isFromEntity = server_canHaveAccess(user, metadata.entity, 100);
    const isSuperAdmin = server_canHaveAccess(user, undefined, 1000);

    if (!isFromEntity && !isSuperAdmin) throw new Error("You don't have access to this resource");

    const values = data.map((e) => {
      let value: any;

      if (e.type === "string" || e.type === "url") value = "";
      else if (e.type === "number") value = 0;
      else if (e.type === "date") value = new Date();
      else if (e.type === "boolean") value = false;

      return { ...e, value };
    }) as GenericField[];

    const result = await SubObject.create({
      metadata: {
        ...metadata,
        label,

        created_at: new Date(),
        updated_at: new Date(),

        created_by: getUserMinimum(user),
        updated_by: getUserMinimum(user),
      },
      values,
    });

    let affected_objects = [] as GenericObjectDocument[];
    let new_affected_objects = [] as GenericObjectType[];
    if (result && autoLink) {
      // #region update all objects that are concerned by this subobject creation (autoLink) => update all objects that are in the same entity
      // =================================================================================================

      affected_objects = (await GenericObject.find({ "metadata.entity": entity })) as GenericObjectDocument[];
      if (affected_objects.length !== 0) {
        new_affected_objects = affected_objects.map((o) => {
          const new_object = { ...o.toJSON() } as GenericObjectType;
          new_object.metadata.updated_at = new Date();
          new_object.metadata.updated_by = getUserMinimum(user) || undefined;

          // Ensure new_object.children is defined
          if (!new_object.children) new_object.children = {};

          // Define children[label] if not exists
          if (new_object.children[label])
            // @ts-ignore - children is not included in subobjects
            new_object.children[label].push({ _id: result._id, metadata: result.metadata, values: result.values });
          // @ts-ignore - children is not included in subobjects
          else new_object.children[label] = [{ _id: result._id, metadata: result.metadata, values: result.values }];

          return new_object;
        });

        // Update all affected objects
        await GenericObject.bulkWrite(
          new_affected_objects.map((o) => ({
            updateOne: {
              filter: { _id: o._id },
              update: { $set: { ...o, [`children['${label}']`]: o.children[label] } },
            },
          })),
        );
      }
      // =================================================================================================
      // #endregion
    }

    if (result) {
      const object_differences =
        affected_objects.length !== 0
          ? affected_objects.map((o) => {
              const new_object = new_affected_objects.find((n) => n._id.toString() === o._id.toString());
              if (!new_object) return [];
              return getDifference(o.toJSON() as GenericObjectType, new_object, `GenericObject/${o._id}`);
            })
          : [];

      const differences = [...object_differences.flat()];

      await History.create({
        metadata: {
          label,
          entity,
          type: "create",
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

    return res.status(201).json({ data: result, error: null });
  } catch (error) {
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la création du sous-objet.",
      },
    });
  }
}
export default withDatabase(handler);
