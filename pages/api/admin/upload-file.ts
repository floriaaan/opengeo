import { server_canHaveAccess } from "@/hooks/useHabilitation";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { getEntityFromContact } from "@/lib/user";
import { GenericObject } from "@/models";
import { File, FileDocument } from "@/models/File";
import { GenericObject as GOT } from "@/types/generic-object";
import { IncomingForm } from "formidable";
import { cp, rm } from "fs/promises";
import { nanoid } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_PATH = "./public/upload";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method } = req;
    const user = getSessionOrThrow(req);
    if (!user) throw new Error("User not found");
    const entity = getEntityFromContact(user);
    const haveAccess = server_canHaveAccess(user, undefined, 100);
    if (!haveAccess) throw new Error("You don't have access to this resource");

    const form = new IncomingForm();
    form.parse(req, async (error, fields, files) => {
      if (error)
        return res.status(500).json({
          data: null,
          error: {
            message: (error as Error).message ?? "Une erreur est survenue lors de l'upload du fichier",
          },
        });

      switch (method) {
        case "POST":
          try {
            const file = files?.file?.[0];
            if (!file)
              return res.status(400).json({
                data: null,
                error: { message: "Un fichier est requis pour le traitement." },
              });
            const name = file.originalFilename;
            const type = file.mimetype;

            if (!file || !name || !type)
              return res.status(400).json({
                data: null,
                error: { message: "Le fichier est invalide" },
              });

            if (file.size > DEFAULT_MAX_FILE_SIZE)
              return res.status(400).json({
                data: null,
                error: { message: "Le fichier est trop volumineux" },
              });

            const path = `${DEFAULT_PATH}/${nanoid()}${file.originalFilename?.substring(
              file.originalFilename.lastIndexOf("."),
            )}`;

            await cp(file.filepath, path);
            await rm(file.filepath);

            const f = await File.create({
              name,
              type,
              size: file.size,
              path: path.replace("./public", ""),
              createdBy: {
                cn: user.cn,
                id: user.id,
                entity,
              },
            });

            res.status(200).json({
              data: f,
              error: null,
            });
          } catch (err) {
            res.status(500).json({
              data: null,
              error: {
                message: (error as Error).message ?? "Une erreur est survenue lors de l'upload du fichier",
              },
            });
          }
          break;

        case "DELETE":
          try {
            const _id = req.query._id as string;

            if (!_id)
              return res.status(400).json({
                data: null,
                error: { message: "L'identifiant du fichier est requis pour le traitement" },
              });

            const f = await File.findById(_id);
            if (!f)
              return res.status(404).json({
                data: null,
                error: { message: "Le fichier est introuvable" },
              });

            await rm(`./public${f.path}`);

            const deleted_file = await File.deleteOne({ _id });

            // TODO: delete file from generic objects

            // files are stored in generic objects as an array of objects with the following structure:
            // children.[key as string].values.[index as number].value._id
            const o = (
              await GenericObject.aggregate([
                { $project: { children: { $objectToArray: "$children" } } },
                { $match: { "children.v.values.value._id": _id } },
              ])
            ).map((item) => {
              return {
                ...item,
                children: item.children.reduce(
                  (acc: { [key: string]: GOT }, cur: { k: string; v: GOT }) => ({ ...acc, [cur.k]: cur.v }),
                  {},
                ),
              };
            }) as GOT[];

            // for each generic object, we have to delete the file from the array
            // and then update the generic object

            const updates = await Promise.all(
              o.map(async (item) => {
                const key = Object.keys(item.children).find((k) =>
                  item.children[k].some((v) => v.values.some((vv) => (vv.value as FileDocument)._id === _id)),
                );

                if (!key) return;

                item.children[key] = item.children[key].map((v) => ({
                  ...v,
                  values: v.values.filter((vv) => (vv.value as FileDocument)._id !== _id),
                }));

                return await GenericObject.updateOne({ _id: item._id }, { children: item.children });
              }),
            );

            return res.status(200).json({ data: { delete: deleted_file, updates }, error: null });
          } catch (error) {
            return res.status(500).json({
              data: null,
              error: {
                message: (error as Error).message ?? "Une erreur est survenue lors de la suppression du fichier",
              },
            });
          }

        default:
          res.setHeader("Allow", ["POST", "DELETE"]);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    });
  } catch (error) {
    return res.status(500).json({
      data: null,
      error: { message: (error as Error).message ?? "Une erreur est survenue lors de l'upload du fichier" },
    });
  }
};

export default withDatabase(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
