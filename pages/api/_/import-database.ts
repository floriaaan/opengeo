// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { server_canHaveAccess } from "@/hooks/useHabilitation";
import { log } from "@/lib/log";
import withDatabase from "@/lib/mongo/middleware";
import { getSessionOrThrow } from "@/lib/server/session";
import { UserPreferences } from "@/models/UserPreferences";
import { GenericObject as GenericObjectType } from "@/types/generic-object";
import { ObjectId } from "mongodb";

import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const collections = mongoose.connection.collections;
  const { data } = req.body;

  try {
    const user = getSessionOrThrow(req);
    if (!user) throw new Error("Forbidden: No user found");
    const canHaveAccess = server_canHaveAccess(user, undefined, 1000);
    if (!canHaveAccess) throw new Error("Forbidden: User have not correct rights to do this");

    const preferences = await UserPreferences.findOne({ "user.id": user.id });
    if (!preferences?.isDeveloper) throw new Error("Forbidden: User is not developer");

    const db = (
      await Promise.all(
        Object.entries(collections).map(async ([name, collection]) => {
          if (!data[name] || data[name].length === 0 || name === "userpreferences") return;

          let operations = data[name].map((doc: any) => ({
            insertOne: {
              document: {
                ...doc,
                _id: new ObjectId(doc._id),
              },
            },
          }));
          if (name === "genericobjects") {
            operations = operations.map((doc: any) => ({
              insertOne: {
                document: {
                  ...doc.insertOne.document,
                  metadata: {
                    ...doc.insertOne.document.metadata,
                    createdAt: doc.insertOne.document.metadata.createdAt
                      ? new Date(doc.insertOne.document.metadata.createdAt)
                      : undefined,
                    updatedAt: doc.insertOne.document.metadata.updatedAt
                      ? new Date(doc.insertOne.document.metadata.updatedAt)
                      : undefined,
                  },
                  children: Object.entries(
                    doc.insertOne.document.children as Record<string, GenericObjectType[]>,
                  ).reduce((acc, [key, value]) => {
                    return {
                      ...acc,
                      [key]: value.map((e: any) => ({
                        ...e,
                        _id: new ObjectId(e._id),
                      })),
                    };
                  }, {}),
                },
              },
            }));
          }

          if (name === "subobjects") {
            operations = operations.map((doc: any) => ({
              insertOne: {
                document: {
                  ...doc.insertOne.document,
                  metadata: {
                    ...doc.insertOne.document.metadata,
                    createdAt: doc.insertOne.document.metadata.createdAt
                      ? new Date(doc.insertOne.document.metadata.createdAt)
                      : undefined,
                    updatedAt: doc.insertOne.document.metadata.updatedAt
                      ? new Date(doc.insertOne.document.metadata.updatedAt)
                      : undefined,
                  },
                },
              },
            }));
          }

          if (name === "logs") {
            operations = operations.map((doc: any) => ({
              insertOne: {
                document: {
                  ...doc.insertOne.document,
                  timestamp: new Date(doc.insertOne.document.timestamp),
                },
              },
            }));
          }

          if (name === "habilitations") {
            operations = operations.map((doc: any) => ({
              insertOne: {
                document: {
                  ...doc.insertOne.document,
                  validatedAt: new Date(doc.insertOne.document.validatedAt),
                  createdAt: new Date(doc.insertOne.document.createdAt),
                },
              },
            }));
          }

          const docs = await collection.bulkWrite(operations);

          return {
            [name]: {
              ok: docs.ok,
              insertedCount: docs.insertedCount,
              modifiedCount: docs.modifiedCount,
            },
          };
        }),
      )
    ).reduce((acc, curr) => ({ ...acc, ...curr }), {});

    return res.status(200).json({ data: db, error: null });
  } catch (error) {
    log.error(error);
    return res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "An error occurred while importing the database.",
      },
    });
  }
}
export default withDatabase(handler);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 10,
};
