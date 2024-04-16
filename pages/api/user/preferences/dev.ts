import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { UserPreferences, UserPreferencesDocument } from "@/models/UserPreferences";
import { APIResult } from "@/types/api";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse<APIResult<UserPreferencesDocument>>) => {
  try {
    const { id, cn } = getSessionOrThrow(req) || {};
    const preferences = await UserPreferences.findOneAndUpdate(
      { "user.id": id },
      { isDeveloper: true, updatedAt: new Date(), user: { id, cn } },
      { returnDocument: "after", upsert: true },
    );

    return res.status(200).json({ data: preferences, error: null });
  } catch (error) {
    return res.status(500).json({
      data: null,
      error: {
        message:
          (error as Error).message ??
          "Une erreur est survenue lors de la mise à jour des préférences de l'utilisateur.",
      },
    });
  }
};

export default withDatabase(handler);
