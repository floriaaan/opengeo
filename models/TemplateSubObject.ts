import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * Define a new Mongoose schema for TemplateSubObject
 *
 * @remarks The schema defines the structure of documents in a MongoDB collection for template sub-objects.
 *
 * @remarks The schema has the following properties:
 * - metadata: an object that contains metadata for the object, including the label, entity, creation date, last update date, and authorization
 * - values: an array of objects that contains the values for the object, including the label, type, and value
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
const TemplateSubObjectSchema = new Schema({
  label: {
    type: String,
    required: true,
  },
  entity: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
  },
  values: {
    required: true,
    type: Object,
    default: {},
  },
});

export const TemplateSubObject =
  mongoose.models.TemplateSubObject || mongoose.model("TemplateSubObject", TemplateSubObjectSchema);

export type TemplateDocument = {
  label: string;
  entity: string;
  created_at: Date;
  updated_at: Date;
  values: Object[];
};
