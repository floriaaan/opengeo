/* eslint-disable no-unreachable */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import withDatabase from "@/lib/mongo/middleware";
import { TemplateSubObject } from "@/models/TemplateSubObject";
import { APIResult } from "@/types/api";
import { SubObjectTemplate } from "@/types/generic-object";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = SubObjectTemplate;

async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  //variables
  let id = req.body.id;
  let data = req.body.values;

  return res.status(500).json({
    data: null,
    error: {
      message: "Cette fonctionnalité est désactivée pour le moment.",
    },
  });

  //Update
  try {
    // const object = await TemplateSubObject.findOne({ _id: id });
    const result = await TemplateSubObject.findOneAndUpdate(
      { _id: id },
      {
        updated_at: Date.now(),
        values: data,
      },
    );
    res.status(200).json({
      data: result,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la mise à jour du modèle de sous-objet.",
      },
    });
  }
}
export default withDatabase(handler);
