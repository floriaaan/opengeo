import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { getSessionOrThrow } from "@/lib/server/session";
import { NextApiRequest, NextApiResponse } from "next";

export const SEP = ";";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = getSessionOrThrow(req);
    const haveAccess = server_canHaveAccess(user, undefined, 100);
    if (!haveAccess) throw new Error("You don't have access to this resource");

    const { rows, cols, data } = req.body as { rows: string[]; cols: string[]; data: string[][] };
    let csv = SEP + cols.join(SEP) + "\n";
    data.forEach((row, index) => {
      csv += rows[index] + SEP + row.join(SEP) + "\n";
    });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=template.csv");
    res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la création du fichier CSV.",
      },
    });
  }
};

export default handler;
