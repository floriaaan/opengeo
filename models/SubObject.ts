import { SubObjectMetadata } from "@/types/global";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * Define a new Mongoose schema for SubObject
 *
 * @remarks The schema defines the structure of documents in a MongoDB collection for sub-objects.
 *
 * @remarks The schema has the following properties:
 * - metadata: an object that contains metadata for the object, including the label, entity, creation date, last update date, and authorization
 * - values: an array of objects that contains the values for the object, including the label, type, and value (value is the default value)
 *
 * @example
 * {
 *   _id: ObjectId('***'),
 *   metadata: {
 *     label: '***',
 *     entity: '***',
 *     created_at: ISODate(),
 *     updated_at: ISODate(),
 *     authorization: ''
 *   },
 *   values: [
 *     {
 *       label: 'Nom',
 *       type: 'string',
 *       value: '***'
 *     },
 *   ],
 * }
 */
const SubObjectSchema = new Schema({
  metadata: {
    required: true,
    type: Object,
  },
  values: {
    required: true,
    type: Array,
    default: [],
  },
});

export const SubObject = mongoose.models.SubObject || mongoose.model("SubObject", SubObjectSchema);

export type SubObjectDocument = mongoose.Document & SubObjectType;

export type SubObjectType = {
  _id: string;
  metadata: SubObjectMetadata;
  values: {
    label: string;
    type: string;
    value: any;
  }[];
};
