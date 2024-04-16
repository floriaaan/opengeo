/* eslint-disable no-unreachable */
import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { TemplateDocument, TemplateSubObject } from "@/models";
import { APIResult } from "@/types/api";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = { success: true };

async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  const _id = req.body.id;

  return res.status(500).json({
    data: null,
    error: {
      message: "Cette fonctionnalité est désactivée pour le moment.",
    },
  });

  try {
    const user = getSessionOrThrow(req);

    const template = (await TemplateSubObject.findById(_id)) as TemplateDocument;

    const haveAccess = server_canHaveAccess(user, template.entity, 100);
    if (!haveAccess) throw new Error("You don't have access to this resource");

    await TemplateSubObject.findByIdAndDelete(_id);
    res.status(200).json({
      data: { success: true },
      error: null,
    });
  } catch (error) {
    log.error(error);
    res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la suppression du modèle de sous-objets.",
      },
    });
  }
}
export default withDatabase(handler);
