import { server_canHaveAccess } from "@/hooks/useHabilitation";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { getEntityFromContact } from "@/lib/user";
import { GenericObject, Habilitation, History, SubObject, TemplateSubObject } from "@/models";
import { Logs } from "@/models/Logs";
import { UserPreferences } from "@/models/UserPreferences";
import { APIResult } from "@/types/api";
import { GenericObject as GenericObjectType } from "@/types/generic-object";
import { HistoryType } from "@/types/history";
import { Logs as LogsType } from "@/types/log";
import { User } from "@/types/user";
import { calculatePercentageChange, dates } from "@components/admin/dashboard/visits";
import { NextApiRequest, NextApiResponse } from "next";

export type ResultGET = {
  visits: Visits;
  counts: Counts;
  history: HistoryType[];
};

type LogWithUser = Pick<LogsType, "user" | "timestamp"> & {
  user: { id: string };
};

const { last: last_month, current: current_month } = dates;

const handler = async (req: NextApiRequest, res: NextApiResponse<APIResult<ResultGET>>) => {
  try {
    const user = getSessionOrThrow(req);
    const haveAccess = server_canHaveAccess(user, undefined, 100);
    if (!haveAccess) throw new Error("You don't have access to this resource");

    return res.status(200).json({
      data: { visits: await getVisits(), counts: await getCounts(), history: await getHistory(user) },
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la récupération des données.",
      },
    });
  }
};

export default withDatabase(handler);

export type Visits = {
  last: number;
  current: number;
  distinct: {
    current: number;
    last: number;
    total: number;
    today: number;
    yesterday: number;
  };
  chart: {
    date: string;
    users: number;
  }[];
  percent: {
    day: number;
    month: number;
  };
  users: Pick<LogsType, "user">[];
};

const fields = "user timestamp" as const;
/**
 * get visits from the last month, compare to the month before
 *  */
const getVisits = async () => {
  const q_current = await Logs.find({ timestamp: { $gte: current_month } }).select(fields);
  const q_last = await Logs.find({ timestamp: { $gte: last_month, $lt: current_month } }).select(fields);

  const users = await Logs.distinct("user");

  const v_current = q_current.reduce(
    (acc, cur) => {
      const date = cur.timestamp.toISOString().split("T")[0];
      if (!acc[date]) acc[date] = new Set();
      acc[date].add(cur.user?.id);
      return acc;
    },
    {} as Record<string, Set<string>>,
  ) as Record<string, Set<string>>;

  const v_current_chart = Object.entries(v_current).map(([date, users]) => ({ date, users: users.size }));
  const distinctUsers = (logs: LogWithUser[]) => new Set(logs.map((log) => log.user?.id)).size;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const q_today = q_current.filter((v) => new Date(v.timestamp).toISOString().split("T")[0] === today);
  const q_yesterday = q_current.filter((v) => new Date(v.timestamp).toISOString().split("T")[0] === yesterday);

  const distinct = {
    today: distinctUsers(q_today),
    yesterday: distinctUsers(q_yesterday),
    current: distinctUsers(q_current),
    last: distinctUsers(q_last),
    total: users.length,
  };

  return {
    last: q_last.length,
    current: q_current.length,
    distinct,
    chart: v_current_chart,
    percent: {
      day: calculatePercentageChange(distinct.today, distinct.yesterday),
      month: calculatePercentageChange(distinct.current, distinct.last),
    },
    users: users,
  } as Visits;
};

export type Counts = {
  userPreferences: number;
  genericObjects: number;
  subObjects: number;
  logs: number;
  templates: number;
  entities: string[];
  habilitations: {
    count: number;
    last: string;
  };
};

const getCounts = async () => {
  const userPreferences = await UserPreferences.countDocuments();
  const genericObjects = await GenericObject.countDocuments();
  const subObjects = await SubObject.countDocuments();
  const logs = await Logs.countDocuments();
  const templates = await TemplateSubObject.countDocuments();
  const entities = ((await GenericObject.find()) as GenericObjectType[]).reduce((acc, cur) => {
    if (cur.metadata.entity && !acc.includes(cur.metadata.entity)) acc.push(cur.metadata.entity);
    return acc;
  }, [] as string[]);
  const habilitations = {
    count: await Habilitation.find().countDocuments(),
    last: (await Habilitation.findOne().sort({ createdAt: -1 }))?.createdAt.toISOString() ?? "",
  };

  return {
    userPreferences,
    genericObjects,
    subObjects,
    logs,
    templates,
    entities,
    habilitations,
  } as Counts;
};

const getHistory = async (user: User) => {
  const entity = getEntityFromContact(user);
  const haveMinimalAdminAccess = server_canHaveAccess(user, undefined, 100);
  const haveFullAdminAccess = server_canHaveAccess(user, undefined, 100);

  if (!haveFullAdminAccess && !haveMinimalAdminAccess)
    throw new Error("Vous n'avez pas les droits pour accéder à cette ressource.");

  let history = [] as HistoryType[];
  if (haveMinimalAdminAccess && !haveFullAdminAccess)
    history = await History.find({ entity }).sort({ "metadata.created_at": -1 }).limit(100);
  else if (haveFullAdminAccess) history = await History.find().sort({ "metadata.created_at": -1 }).limit(100);

  return history;
};
