/* eslint-disable no-unreachable */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { toObjectId } from "@/lib/mongo/toObjectId";
import { TemplateSubObject } from "@/models/TemplateSubObject";
import { SubObjectTemplate } from "@/types/generic-object";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = SubObjectTemplate | SubObjectTemplate[] | null;
/**
 * A function that handles requests to the Next.js API route for retrieving all `TemplateSubObject`s.
 *
 * @remarks The function takes two arguments: `req`, which is the request object, and `res`, which is the response object. The function uses the `TemplateSubObject.find` method to retrieve all `TemplateSubObject`s from the database. The function returns a JSON object with the retrieved `TemplateSubObject`s as the response body.
 *
 * @param req - The request object.
 * @param res - The response object.
 *
 * @returns A JSON object with the retrieved `TemplateSubObject`s as the response body.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    return res.status(500).json({
      data: null,
      error: {
        message: "Cette fonctionnalité est désactivée pour le moment.",
      },
    });

    const { id, name, select, entity } =
      (req.query as { id: string; name: string; select: string; entity: string }) || {};

    if (id)
      return res.status(200).json({ data: await TemplateSubObject.findOne({ _id: toObjectId(id) }), error: null });
    else if (entity)
      return res.status(200).json({
        data: await TemplateSubObject.find({
          entity: entity.toLocaleUpperCase(),
        }),
        error: null,
      });
    else if (name) return res.status(200).json({ data: await TemplateSubObject.findOne({ label: name }), error: null });
    else if (select) return res.status(200).json({ data: await TemplateSubObject.find().select(select), error: null });
    else return res.status(200).json({ data: await TemplateSubObject.find(), error: null });
  } catch (error) {
    log.error(error);
    res.status(500).json({
      data: null,
      error: {
        message:
          (error as Error).message ?? "Une erreur est survenue lors de la récupération du modèle de sous-objets.",
      },
    });
  }
}
export default withDatabase(handler);
