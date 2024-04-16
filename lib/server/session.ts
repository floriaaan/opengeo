import {
  habilitation as local_habilitation,
  session as local_session,
  user as local_user,
} from "@/resources/local-fallbacks";
import { User } from "@/types/user";
import { NextApiRequest } from "next";

export const getSessionOrThrow = (req: NextApiRequest) => {
  if (process.env.NEXT_PUBLIC_LOCAL === "true")
    return { ...local_user, ...local_session, habilitation: local_habilitation };
  const userCookies = req.cookies["opengeo-user"] ?? null;

  if (!userCookies) throw new Error("User not found");
  const user = JSON.parse(userCookies);

  return user! as User;
};

export const getSession = (req: NextApiRequest): User => {
  const userCookies = req.cookies["opengeo-user"] ?? null;

  if (!userCookies) return null;
  const user = JSON.parse(userCookies);

  return user as User;
};
