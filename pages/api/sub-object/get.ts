// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { getSession } from "@/lib/server/session";
import { SubObject, SubObjectDocument } from "@/models/SubObject";
import { APIResult } from "@/types/api";
import { roles } from "@components/habilitations/roles";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = SubObjectDocument | SubObjectDocument[] | null;

/**
 * A function that handles requests to the Next.js API route for retrieving sub-objects.
 *
 * @remarks The function takes two arguments: `req`, which is the request object, and `res`, which is the response object. The function retrieves the ID or name query parameter from the request, and uses the `SubObject.find` or `SubObject.findOne` method to retrieve the sub-object(s) from the database. The function returns a JSON object with the retrieved sub-object(s) as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @param req - The request object.
 * @param res - The response object.
 *
 * @returns A JSON object with the retrieved sub-object(s) as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 */
async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  try {
    const { id, name, select } = (req.query as { id: string; name: string; select: string; entity: string }) || {};
    const entity = (req.query as { entity: string })?.entity?.toLocaleUpperCase();

    let result: Result = null;

    if (id) result = (await SubObject.findById(id)) as SubObjectDocument;
    else if (entity) result = (await SubObject.find({ "metadata.entity": entity })) as SubObjectDocument[];
    else if (name) result = (await SubObject.findOne({ "metadata.label": name })) as SubObjectDocument;
    else if (select) result = (await SubObject.find().select(select)) as SubObjectDocument[];
    else result = (await SubObject.find()) as SubObjectDocument[];

    const user = getSession(req);

    if (Array.isArray(result)) {
      result = result
        .filter((o) =>
          server_canHaveAccess(
            user,
            o.metadata.entity,
            roles.find((r) => o.metadata.authorization === r.value)?.level ?? 0,
          ),
        )
        .map((o) => o.toJSON());
    } else {
      result =
        result &&
        server_canHaveAccess(
          user,
          result.metadata.entity,
          // @ts-ignore
          roles.find((r) => result?.metadata.authorization === r.value)?.level ?? 0,
        )
          ? result.toJSON()
          : null;
    }

    return res.status(200).json({ data: result, error: null });
  } catch (error) {
    log.error(error);
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la récupération du sous-objet.",
      },
    });
  }
}
export default withDatabase(handler);
