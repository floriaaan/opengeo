// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { getSession } from "@/lib/server/session";
import { GenericObject, GenericObjectDocument } from "@/models/GenericObject";
import { APIResult } from "@/types/api";
import { roles } from "@components/habilitations/roles";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = GenericObjectDocument | GenericObjectDocument[] | Partial<GenericObjectDocument>[] | null;

/**
 * A function that handles requests to the Next.js API route for retrieving generic objects.
 *
 * @remarks The function takes two arguments: `req`, which is the request object, and `res`, which is the response object. The function retrieves the query parameters from the request object, and uses the `GenericObject` model to retrieve the corresponding generic objects from the database. The function returns a JSON object with the retrieved generic objects as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @param req - The request object.
 * @param res - The response object.
 *
 * @returns A JSON object with the retrieved generic objects as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @example
 * // GET /api/genericObject/get?id=614f6f6f6f6f6f6f6f6f6f6f
 * // Response: { "data": { "_id": "614f6f6f6f6f6f6f6f6f6f6f", "metadata": { "label": "MyObject", "entity": "DR Normandie", "created_at": "2021-09-25T12:00:00.000Z", "updated_at": "2021-09-25T12:00:00.000Z" }, "values": [ ... ], "children": [ ... ] }, "error": null }
 */
async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  const { id, data, select } = (req.query as { id: string; data: string; entity: string; select: string }) || {};
  const entity = (req.query as { entity: string })?.entity?.toLocaleUpperCase();
  let result: Result = null;

  try {
    if (data == "site") result = (await GenericObject.find({ "metadata.label": "site" })) as GenericObjectDocument[];
    else if (entity) result = (await GenericObject.find({ "metadata.entity": entity })) as GenericObjectDocument[];
    else if (id) result = (await GenericObject.findById(id)) as GenericObjectDocument;
    else if (select) result = (await GenericObject.find().select(select)) as Partial<GenericObjectDocument>[];
    else result = (await GenericObject.find()) as GenericObjectDocument[];

    const user = getSession(req);

    if (Array.isArray(result)) {
      result = result.map((o) => ({
        // @ts-expect-error Because of the toJSON() method, the type of o is not GenericObjectDocument but Partial<GenericObjectDocument> but it is Partial because of the select() method
        ...o.toJSON(),
        children: o.children
          ? Object.entries(o.children)
              .sort(([, a], [, b]) => {
                if (!a[0]?.metadata?.label || !b[0]?.metadata?.label) return 0;
                return a[0].metadata.label.localeCompare(b[0].metadata.label);
              })
              .reduce((acc, [key, value]) => {
                return {
                  ...acc,
                  [key]: value.map((v) => ({
                    ...v,
                    values: server_canHaveAccess(
                      user,
                      v.metadata.entity,
                      roles.find((r) => v.metadata.authorization === r.value)?.level ?? 0,
                    )
                      ? v.values
                      : [],
                  })),
                  // todo: fix the filter
                  // ensure that the sub-objects have at least one value
                  // .filter((v) =>
                  //   // filter the sub-objects that have at least one value
                  //   // nb: it permits to remove the sub-objects that have no value on update
                  //   v.values.some(
                  //     (v) =>
                  //       !!v.value ||
                  //       (v.type === "number" && v.value === 0) ||
                  //       (v.type === "boolean" && v.value === "false"),
                  //   ),
                  // ),
                };
              }, {})
          : undefined,
      }));
    } else {
      if (result)
        result = {
          ...result.toJSON(),
          children: Object.entries(result.children)
            .sort(([, a], [, b]) => {
              if (!a[0]?.metadata?.label || !b[0]?.metadata?.label) return 0;
              return a[0].metadata.label.localeCompare(b[0].metadata.label);
            })
            .reduce((acc, [key, value]) => {
              return {
                ...acc,
                [key]: value.map((v) => ({
                  ...v,
                  values: server_canHaveAccess(
                    user,
                    v.metadata.entity,
                    roles.find((r) => v.metadata.authorization === r.value)?.level ?? 0,
                  )
                    ? v.values
                    : [],
                })),
                // todo: fix the filter
                // ensure that the sub-objects have at least one value
                // .filter((v) =>
                //   // filter the sub-objects that have at least one value
                //   // nb: it permits to remove the sub-objects that have no value on update
                //   v.values.some(
                //     (v) =>
                //       !!v.value ||
                //       (v.type === "number" && v.value === 0) ||
                //       (v.type === "boolean" && v.value === "false"),
                //   ),
                // ),
              };
            }, {}),
        };
    }

    return res.status(200).json({ data: result, error: null });
  } catch (error) {
    log.error(error);
    return res.status(500).json({
      data: null,
      error: { message: (error as Error).message ?? "Une erreur est survenue lors de la récupération des données." },
    });
  }
}
export default withDatabase(handler);
