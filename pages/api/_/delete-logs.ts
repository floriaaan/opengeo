// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { Logs } from "@/models/Logs";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const mode = req.query.mode?.toString().toLowerCase();
    if (mode !== "debug") throw new Error("Invalid mode");
    if (process.env.NODE_ENV !== "development" || process.env.NEXT_PUBLIC_DEV !== "true")
      throw new Error("Invalid environment");

    const result = await Logs.deleteMany({});
    res.status(201).json({ data: result, error: null });
  } catch (error) {
    log.error(error);
    res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la suppression des logs.",
      },
    });
  }
}
export default withDatabase(handler);
