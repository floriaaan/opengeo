// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { getEntityFromContact } from "@/lib/user";
import { Suggestion, SuggestionDocument } from "@/models/Suggestion";
import { APIResult } from "@/types/api";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = SuggestionDocument;

async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  try {
    const user = getSessionOrThrow(req);
    const { cn, id } = user || {};
    if (!cn || !id) throw new Error("User not found");
    const entity = getEntityFromContact(user);

    const result = await Suggestion.create({
      user: { cn, id },
      path: req.body.path,
      entity,
      initialValue: req.body.initialValue,
      suggestion: req.body.suggestion,
      message: req.body.message,
    });
    return res.status(201).json({ data: result, error: null });
  } catch (error) {
    // log.error(error);
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la création de la suggestion.",
      },
    });
  }
}
export default withDatabase(handler);
