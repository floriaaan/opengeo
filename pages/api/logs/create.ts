// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { Logs } from "@/models/Logs";
import { APIResult } from "@/types/api";
import { Log as LogsType } from "@/types/log";
import type { NextApiRequest, NextApiResponse } from "next";

export type Result = LogsType;

/**
 * A function that handles requests to the Next.js API route for creating a new log entry.
 *
 * @remarks The function takes two arguments: `req`, which is the request object, and `res`, which is the response object. The function retrieves the user, method, and path of the log entry to create from the request body, and uses the `Logs.create` method to insert the entry into the database. The function returns a JSON object with the created log entry as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 *
 * @param req - The request object.
 * @param res - The response object.
 *
 * @returns A JSON object with the created log entry as the `data` property and a `null` value for the `error` property, or a JSON object with a `null` value for the `data` property and an error message as the `error` property if an error occurs.
 */
async function handler(req: NextApiRequest, res: NextApiResponse<APIResult<Result>>) {
  try {
    const data = req.body;

    if (!data.user || !data.method || !data.path)
      throw new Error(
        `Missing parameters: ${[!data.user ? "user" : "", !data.method ? "method" : "", !data.path ? "path" : ""]
          .filter((s) => s !== "")
          .join(", ")}`,
      );

    //Insert
    const result = await Logs.create({
      user: data.user,
      method: data.method,
      path: data.path,
    });
    res.status(201).json({ data: result, error: null });
  } catch (error) {
    log.error(error);
    res.status(500).json({
      data: null,
      error: { message: (error as Error).message ?? "Une erreur est survenue lors de la création du log." },
    });
  }
}
export default withDatabase(handler);
