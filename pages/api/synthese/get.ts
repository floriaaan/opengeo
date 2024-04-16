// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { Synthese, SyntheseDocument } from "@/models/Synthese";
import { APIResult } from "@/types/api";
import { SyntheseType } from "@/types/synthese";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = SyntheseType[] | SyntheseType | null;

async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  const { id, reference } = req.query;
  try {
    const user = getSessionOrThrow(req);
    const haveAccess = server_canHaveAccess(user, undefined, 100);
    const isSimpleRequest = !!id || !!reference;
    if (!haveAccess && !isSimpleRequest) throw new Error("You don't have access to this resource");

    let result: Result = null;
    if (id) result = (await Synthese.findById(id)) as SyntheseDocument;
    else if (reference) result = (await Synthese.find({ "metadata.reference": reference })) as SyntheseDocument[];
    else result = (await Synthese.find()) as SyntheseDocument[];

    return res.status(200).json({
      data: Array.isArray(result)
        ? result.map((s) => (s as SyntheseDocument).toJSON() as SyntheseType)
        : ((result as SyntheseDocument).toJSON() as SyntheseType),
      error: null,
    });
  } catch (error) {
    log.error(error);
    return res.status(500).json({
      data: null,
      error: { message: (error as Error).message ?? "Une erreur est survenue lors de la récupération des données" },
    });
  }
}
export default withDatabase(handler);
