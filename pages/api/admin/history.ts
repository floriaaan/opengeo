import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { getEntityFromContact } from "@/lib/user";
import { History } from "@/models";

import { APIResult } from "@/types/api";
import { HistoryType } from "@/types/history";
import { NextApiRequest, NextApiResponse } from "next";

export type ResultGET = HistoryType[];

async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<ResultGET>>) {
  const user = getSessionOrThrow(req);
  const entity = getEntityFromContact(user);

  try {
    switch (req.method) {
      case "GET": {
        const haveMinimalAdminAccess = server_canHaveAccess(user, undefined, 100);
        const haveFullAdminAccess = server_canHaveAccess(user, undefined, 100);

        if (!haveFullAdminAccess && !haveMinimalAdminAccess)
          throw new Error("Vous n'avez pas les droits pour accéder à cette ressource.");

        let history = [] as HistoryType[];
        if (haveMinimalAdminAccess && !haveFullAdminAccess)
          history = await History.find({ entity }).sort({ "metadata.created_at": -1 }).limit(100);
        else if (haveFullAdminAccess) history = await History.find().sort({ "metadata.created_at": -1 }).limit(100);

        return res.status(200).json({ data: history, error: null });
      }

      default:
        throw new Error("Method not allowed");
    }
  } catch (error) {
    log.error(error);
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la récupération des habilitations.",
      },
    });
  }
}
export default withDatabase(handler);
