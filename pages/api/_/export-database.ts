// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { UserPreferences } from "@/models/UserPreferences";

import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const collections = mongoose.connection.collections;
  try {
    const user = getSessionOrThrow(req);
    if (!user) return res.status(401).json({ data: null, error: { message: { title: "Unauthorized" } } });
    const canHaveAccess = server_canHaveAccess(user, undefined, 1000);
    if (!canHaveAccess) return res.status(403).json({ data: null, error: { message: { title: "Forbidden" } } });

    const preferences = await UserPreferences.findOne({ "user.id": user.id });
    if (!preferences?.isDeveloper)
      return res.status(403).json({ data: null, error: { message: { title: "Forbidden" } } });

    // Addionnal security check
    if (user.id !==  "@floriaaan")
      return res.status(403).json({ data: null, error: { message: { title: "Forbidden" } } });

    const db = await Promise.all(
      Object.entries(collections).map(async ([name, collection]) => {
        const documents = await collection.find().toArray();
        return [name, documents];
      }),
    );

    const dbObject = Object.fromEntries(db);
    return res.status(200).json({ data: dbObject, error: null });
  } catch (error) {
    log.error(error);
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "An error occurred while exporting the database.",
      },
    });
  }
}
export default withDatabase(handler);
