import { server_canHaveAccess } from "@/hooks/useHabilitation";
import withDatabase from "@/lib/mongo/middleware";
import { getSession } from "@/lib/server/session";
import { getEntityFromContact } from "@/lib/user";
import { HabilitationDemande } from "@/models/Habilitation";
import { Suggestion } from "@/models/Suggestion";
import type { NextApiRequest, NextApiResponse } from "next";

// response is volontarily short to avoid sending too much data because it's called every 5 seconds
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = getSession(req);
    const entity = user ? getEntityFromContact(user) : null;

    // If the user is an admin, we return the number of pending habilitations and suggestions
    const elevated_notifications = server_canHaveAccess(user, undefined, 100)
      ? { h: await HabilitationDemande.count(), s: entity ? await Suggestion.count({ entity }) : 0 }
      : {};

    return res.status(200).json({ ...elevated_notifications });
  } catch (error) {
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la récupération des notifications.",
      },
    });
  }
};

export default withDatabase(handler);
