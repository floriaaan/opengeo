// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { Logs } from "@/models/Logs";
import { APIResult } from "@/types/api";
import { Log as LogsType } from "@/types/log";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = { logs: LogsType[]; count: number };

/**
 * A function that handles requests to the Next.js API route for retrieving logs.
 *
 * @remarks The function takes two arguments: `req`, which is the request object, and `res`, which is the response object. The function retrieves the offset and limit query parameters from the request, and uses the `Logs.find` method to retrieve the logs from the database. The function returns a JSON object with the retrieved logs as the `logs` property and the total count of logs as the `count` property of the `data` property, and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @param req - The request object.
 * @param res - The response object.
 *
 * @returns A JSON object with the retrieved logs as the `logs` property and the total count of logs as the `count` property of the `data` property, and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 */
async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  try {
    const user = getSessionOrThrow(req);
    const haveAccess = server_canHaveAccess(user, undefined, 1000);
    if (!haveAccess) throw new Error("You don't have access to this resource");

    const result = await Logs.find()
      .skip(Number(req.query.offset as string))
      .limit(Number(req.query.limit as string))
      .sort({ timestamp: "desc" });
    res.status(200).json({ data: { logs: result, count: await Logs.count() }, error: null });
  } catch (error) {
    log.error(error);
    res.status(500).json({
      data: null,
      error: { message: (error as Error).message ?? "Une erreur est survenue lors de la récupération des logs." },
    });
  }
}
export default withDatabase(handler);
