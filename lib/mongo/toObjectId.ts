import { ObjectId as TypeObjectId } from "mongoose";
const ObjectId = require("mongoose").Types.ObjectId;
/**
 * It converts a string to a mongoose ObjectId.
 * @param {string} str - The string to convert to an ObjectId.
 * @returns ObjectId.
 */
export const toObjectId = (str: string): TypeObjectId => {
  if (!str) throw new Error("str is required");

  return new ObjectId(str.toString());
};
