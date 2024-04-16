import type { NextApiRequest, NextApiResponse } from "next";

import {
  // GenericObject, SubObject, TemplateSubObject,
  Logs,
} from "@/models";

const HOUR_IN_MS = 3600 * 1000;
const DAY_IN_MS = HOUR_IN_MS * 24;
const YEAR_IN_MS = DAY_IN_MS * 365.25;

const PERIOD = YEAR_IN_MS / 2;
const date = new Date(Date.now() - PERIOD);

async function rgpd(_req: NextApiRequest, res: NextApiResponse) {
  const logs = await Logs.updateMany(
    { timestamp: { $lte: date }, "user.id": { $ne: "?" } },
    { $set: { "user.id": "?", "user.cn": "Anonyme" } },
  );

  return res.status(218).json({
    data: {
      logs: logs.modifiedCount,
    },
    options: {
      since: date.toISOString(),
    },
  });
}

export default rgpd;
