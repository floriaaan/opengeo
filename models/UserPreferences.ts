import { log } from "@/lib/log";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const schema = new Schema({
  user: { required: true, type: Object },
  pinnedSubObjects: { required: true, type: Array },
  isDeveloper: { required: false, type: Boolean },

  updatedAt: { type: Date, default: () => Date.now() },
});

export const UserPreferences = mongoose.models.UserPreferences || mongoose.model("UserPreferences", schema);

export type UserPreferencesDocument = mongoose.Document & {
  user: { cn: string; id: string };
  pinnedSubObjects: string[];
  isDeveloper?: boolean;

  updatedAt: Date;
};

UserPreferences.syncIndexes();

// Check if mongoose.models.UserPreferences matches the defined schema
const model = mongoose.models.UserPreferences;

if (model) {
  const schem_keys = Object.keys(schema.paths);
  const model_keys = Object.keys(model.schema.paths);

  const missingKeys = schem_keys.filter((key) => !model_keys.includes(key));

  if (missingKeys.length > 0) log.warn(`UserPreferences model is missing keys: ${missingKeys.join(", ")}`);
  // else log.debug("UserPreferences model is up to date.");
}
