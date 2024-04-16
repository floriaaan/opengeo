// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { Habilitation, Log } from "@/models";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const model = (req.query.model as string).toLowerCase();
  try {
    switch (model) {
      case "logs": {
        // find all logs where timestamp is not ISODate but string
        const logs = await Log.find({ timestamp: { $type: "string" } });

        // update them to ISODate using bulkWrite
        const bulkWriteQuery = logs.map((log) => ({
          updateOne: {
            filter: { _id: log._id },
            update: { $set: { timestamp: new Date(log.timestamp) } },
          },
        }));
        const bulk = await Log.bulkWrite(bulkWriteQuery);

        return res.status(200).json({ data: bulk, error: null });
      }
      case "habilitations": {
        // remove duplicate habilitations by keeping the last one
        const habilitations = await Habilitation.find();

        const habilitationsToDelete = habilitations.filter((habilitation, index, self) => {
          const firstIndex = self.findIndex((h) => h.user.id === habilitation.user.id);
          return index !== firstIndex;
        });

        const bulk = await Habilitation.deleteMany({ _id: { $in: habilitationsToDelete.map((h) => h._id) } });

        return res.status(200).json({ data: bulk, error: null });
      }
      default: {
        throw new Error();
      }
    }
  } catch (error) {
    log.error(error);
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? `An error occurred while repairing model: ${model}`,
      },
    });
  }
}
export default withDatabase(handler);
