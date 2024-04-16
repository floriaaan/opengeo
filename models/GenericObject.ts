import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Define a new Mongoose schema for GenericObject
 *
  @remarks children is a recursive object that contains the same structure as GenericObject, it is an instance of SubObject model

  @remarks metadata is an object that contains the following fields:
    - label: the label of the object
    - entity: the entity of the object
    - created_at: the creation date of the object
    - updated_at: the last update date of the object
    - authorization: the authorization of the object
  @remarks values is an array of objects that contains the following fields:
    - label: the label of the value
    - type: the type of the value
    - value: the value

  @example
  {
      _id: ObjectId('***'),
      metadata: {
          label: '***',
          entity: '***',
          created_at: ISODate(),
          updated_at: ISODate(),
          authorization: ''
      },
      values: [
          {
              label: 'Nom',
              type: 'string',
              value: '***'
          },
      ],
      children: {
          ...
      },
    } 

 */
const GenericObjectSchema = new Schema({
  metadata: {
    required: true,
    type: Object,
  },
  values: {
    required: true,
    type: Array,
    default: [],
  },
  children: {
    required: true,
    type: Object,
    default: {},
  },
});

// Define a Mongoose model for GenericObject using the schema
export const GenericObject = mongoose.models.GenericObject || mongoose.model("GenericObject", GenericObjectSchema);

export type GenericObjectDocument = mongoose.Document & {
  _id: string;
  metadata: {
    label: string;
    entity: string;
    created_at: Date;
    updated_at: Date;
    authorization: string;
  };
  values: {
    label: string;
    type: string;
    value: string | number | Date | boolean;
  }[];
  children: {
    [key: string]: GenericObjectDocument[];
  };
};
