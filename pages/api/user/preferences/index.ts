import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { UserPreferences, UserPreferencesDocument } from "@/models/UserPreferences";
import { APIResult } from "@/types/api";
import { NextApiRequest, NextApiResponse } from "next";

const ALLOWED_METHODS = ["GET", "POST"] as const;

const handler = async (req: NextApiRequest, res: NextApiResponse<APIResult<UserPreferencesDocument>>) => {
  switch (req.method) {
    case "GET": {
      try {
        const { id } = getSessionOrThrow(req) || {};
        const preferences = await UserPreferences.findOne({ "user.id": id });

        return res.status(200).json({ data: preferences, error: null });
      } catch (error) {
        return res.status(500).json({
          data: null,
          error: {
            message:
              (error as Error).message ??
              "Une erreur est survenue lors de la récupération des préférences de l'utilisateur.",
          },
        });
      }
    }
    case "POST": {
      const { id, cn } = getSessionOrThrow(req) || {};
      const { subobject_id } = req.body as { subobject_id: string };

      try {
        let preferences = await UserPreferences.findOne({ "user.id": id });
        if (!preferences) await UserPreferences.create({ user: { id, cn } });

        preferences = await UserPreferences.findOneAndUpdate(
          { "user.id": id },
          preferences?.pinnedSubObjects?.includes(subobject_id)
            ? { $pull: { pinnedSubObjects: subobject_id } }
            : { $addToSet: { pinnedSubObjects: subobject_id } },
          { new: true },
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
    }

    default: {
      res.setHeader("Allow", ALLOWED_METHODS);
      return res.status(405).json({
        data: null,
        error: {
          message: `Méthode non autorisée. Utilisez l'une des méthodes suivantes : ${ALLOWED_METHODS.join(", ")}.`,
        },
      });
    }
  }
};

export default withDatabase(handler);
