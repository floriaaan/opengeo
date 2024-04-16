// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";

import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const collections = { ...mongoose.connection.collections };

  try {
    const user = getSessionOrThrow(req);
    const canHaveAccess = server_canHaveAccess(user, undefined, 1000);
    if (!canHaveAccess) return res.status(403).json({ data: null, error: { message: { title: "Forbidden" } } });

    await Promise.all(
      Object.values(collections).map((col) => {
        if (col.name === "userpreferences") return;
        return col.deleteMany({});
      }),
    );

    res.status(201).json({ data: "OK", error: null });
  } catch (error) {
    log.error(error);
    res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "An error occurred while deleting the database.",
      },
    });
  }
}
export default withDatabase(handler);
