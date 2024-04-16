import mongoose, { Mongoose } from "mongoose";
import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { log } from "@/lib/log";

const uri = process.env.MONGODB_URI as string;
if (!uri) log.error("Add Mongo URI to .env.local");

export type GlobalWithMongoose = typeof global & {
  mongoose: Mongoose | undefined;
};

/**
 * Connects to MongoDB and returns a handler that can be used with Next.js API routes.
 *
 *
 * @remarks
 * It could create a new connection every time the handler is called, but that would be inefficient.
 *
 * @example
 * ```ts
 * import withDatabase from "lib/mongodb";
 *
 * const handler = async (req, res) => {
 *    const { method } = req;
 *    switch (method) {
 *      case "GET":
 *        try {
 *          const data = await User.find({});
 *          res.status(200).json({ data });
 *        } catch (error) {
 *          res.status(400).json({ error });
 *        }
 *        break;
 *      default:
 *        res.setHeader("Allow", ["GET"]);
 *        res.status(405).end(`Method ${method} Not Allowed`);
 *    }
 * };
 *
 * export default withDatabase(handler);
 * ```
 *
 *
 * @param handler
 * @returns
 */
const withDatabase = (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // If connection is open, use it
    if (mongoose.connections[0].readyState) return handler(req, res);
    // Else, use new connection
    (global as GlobalWithMongoose).mongoose = await mongoose.connect(uri);
    return handler(req, res);
  } catch (err) {
    log.error(err);
    return res.status(500).json({
      data: null,
      error: {
        message: (err as Error).message,
        code: 500,
        name: "MONGOOSE_CONNECTION_ERROR",
      },
    });
  }
};

export default withDatabase;
