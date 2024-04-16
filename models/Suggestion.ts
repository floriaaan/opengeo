import { log } from "@/lib/log";
import { GenericFieldValue } from "@/types/generic-object";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

// TODO: refactor to use the same schema as the update model
const schema = new Schema({
  user: { required: true, type: Object },

  path: { type: String, required: true },
  entity: { type: String, required: true },
  initialValue: { type: String, required: true },
  suggestion: { type: String, required: true },
  message: { type: String, required: false },

  createdAt: { type: Date, default: () => Date.now() },
  updatedAt: { type: Date, default: () => Date.now() },
});

export const Suggestion = mongoose.models.Suggestion || mongoose.model("Suggestion", schema);

export type SuggestionDocument = mongoose.Document & {
  user: { cn: string; id: string };

  path: string;
  entity: string;

  initialValue: GenericFieldValue;
  suggestion: GenericFieldValue;
  message?: string;

  createdAt: Date;
  updatedAt: Date;
};

Suggestion.syncIndexes();

// Check if mongoose.models.Suggestion matches the defined schema
const model = mongoose.models.Suggestion;

if (model) {
  const schem_keys = Object.keys(schema.paths);
  const model_keys = Object.keys(model.schema.paths);

  const missingKeys = schem_keys.filter((key) => !model_keys.includes(key));

  if (missingKeys.length > 0) log.warn(`Suggestion model is missing keys: ${missingKeys.join(", ")}`);
  // else log.debug("Suggestion model is up to date.");
}
