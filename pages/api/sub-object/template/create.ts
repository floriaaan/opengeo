/* eslint-disable no-unreachable */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import withDatabase from "@/lib/mongo/middleware";
import { TemplateSubObject } from "@/models/TemplateSubObject";
import { SubObjectTemplate } from "@/types/generic-object";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = SubObjectTemplate;

// API route for template subObject creation.
async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(500).json({
    data: null,
    error: {
      message: "Cette fonctionnalité est désactivée pour le moment.",
    },
  });

  const dataObject = req.body.data;
  const entity = req.body.entity;
  const label = req.body.label;

  try {
    const result = await TemplateSubObject.create({
      label: label,
      entity: entity,
      created_at: Date.now(),
      updated_at: Date.now(),
      values: dataObject,
    });
    res.status(201).json({ data: result, error: null });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la création du modèle de sous-objets.",
      },
    });
  }
}
export default withDatabase(handler);
