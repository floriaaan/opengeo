import { log } from "@/lib/log";
import { HistoryType } from "@/types/history";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const schema = new Schema({
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

export const History = mongoose.models.History || mongoose.model("History", schema);

export type HistoryDocument = mongoose.Document & HistoryType;

History.syncIndexes();

// Check if mongoose.models.History matches the defined schema
const model = mongoose.models.History;

if (model) {
  const schem_keys = Object.keys(schema.paths);
  const model_keys = Object.keys(model.schema.paths);

  const missingKeys = schem_keys.filter((key) => !model_keys.includes(key));

  if (missingKeys.length > 0) log.warn(`${model.modelName} model is missing keys: ${missingKeys.join(", ")}`);
}
