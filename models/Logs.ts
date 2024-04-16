import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * Define a new Mongoose schema for Logs
 *
 * @remarks The schema defines the structure of documents in a MongoDB collection for logs.
 *
 * @remarks The schema has the following properties:
 * - user: an object that contains information about the user who made the request
 * - timestamp: a date that represents the time the request was made
 * - path: a string that represents the path of the request
 * - method: a string that represents the HTTP method of the request
 * - error: an object that contains information about any errors that occurred during the request
 *
 * @example
 * {
 *   _id: ObjectId('***'),
 *   user: {
 *     id: '***',
 *     name: '***',
 *     authorization: '***',
 *   },
 *   timestamp: ISODate(),
 *   path: '***',
 *   method: 'GET',
 * }
 */
const LogsSchema = new Schema({
  user: { required: true, type: Object },
  timestamp: { type: Date, default: () => Date.now() },
  path: { required: true, type: String },
  method: { required: true, type: String },
  error: { type: Object },
});

export const Logs = mongoose.models.Logs || mongoose.model("Logs", LogsSchema);
export const Log = Logs;
