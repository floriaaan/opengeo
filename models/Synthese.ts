import { log } from "@/lib/log";
import { SyntheseType } from "@/types/synthese";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const schema = new Schema({
  metadata: { required: true, type: Object },
  children: { required: true, type: Array, default: [] },
});

export const Synthese = mongoose.models.Synthese || mongoose.model("Synthese", schema);

export type SyntheseDocument = mongoose.Document & SyntheseType;

Synthese.syncIndexes();

// Check if mongoose.models.Synthese matches the defined schema
const model = mongoose.models.Synthese;

if (model) {
  const schem_keys = Object.keys(schema.paths);
  const model_keys = Object.keys(model.schema.paths);
  const missingKeys = schem_keys.filter((key) => !model_keys.includes(key));

  if (missingKeys.length > 0) log.warn(`${model.modelName} model is missing keys: ${missingKeys.join(", ")}`);
}
