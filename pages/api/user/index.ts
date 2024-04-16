import { apigile_contact } from "@/lib/fetchers/apigile";
import withDatabase from "@/lib/mongo/middleware";
import { Habilitation, HabilitationDocument } from "@/models/Habilitation";
import { UserPreferences, UserPreferencesDocument } from "@/models/UserPreferences";
import { APIResult } from "@/types/api";
import { Session } from "@/types/user";
import { NextApiRequest, NextApiResponse } from "next";

type User = {
  identity?: object;
  organization?: object;
  localization?: object;
  contact_point?: object;

  habilitation?: HabilitationDocument;
  preferences?: UserPreferencesDocument;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<APIResult<User>>) => {
  if (req.method === "POST") {
    const { access_token, id } = req.body as Pick<Session, "access_token" | "id">;
    const complete = req.query.complete === "true" ? true : false;

    try {
      const contact_data = complete
        ? await apigile_contact(id, access_token).catch(() => undefined)
        : undefined;

      const habilitation = await Habilitation.findOne({ "user.id": id });
      const preferences = await UserPreferences.findOne({ "user.id": id });

      res.status(200).json({
        data: {
          ...contact_data,
          habilitation,
          preferences,
        },
        error: null,
      });
    } catch (error) {
      res.status(500).json({
        data: null,
        error: {
          message:
            (error as Error).message ?? "Une erreur est survenue lors de la récupération des données de l'utilisateur.",
        },
      });
    }
  } else {
    res.status(405).json({
      data: null,
      error: {
        message: "Méthode non autorisée",
      },
    });
  }
};

export default withDatabase(handler);
