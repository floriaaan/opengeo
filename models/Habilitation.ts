import mongoose from "mongoose";
import { roles } from "@components/habilitations/roles";
const Schema = mongoose.Schema;

const HabilitationSchema = new Schema({
  user: { required: true, type: Object },
  role: { required: true, type: String, enum: roles.map((role) => role.value) },
  validatedBy: { type: Object, default: null },
  validatedAt: { type: Date, default: null },
  createdAt: { type: Date, default: () => Date.now() },
});

export const Habilitation = mongoose.models.Habilitation || mongoose.model("Habilitation", HabilitationSchema);
export type HabilitationDocument = mongoose.Document & {
  user: { cn: string; id: string; entity: string };
  role: string;
  validatedBy: { cn: string; id: string; entity: string };
  validatedAt: Date;
  createdAt: Date;
};

const HabilitationDemandeSchema = new Schema({
  user: { required: true, type: Object },
  role: { required: true, type: String, enum: roles.map((role) => role.value) },
  createdAt: { type: Date, default: () => Date.now() },
});

export const HabilitationDemande =
  mongoose.models.HabilitationDemande || mongoose.model("HabilitationDemande", HabilitationDemandeSchema);
export type HabilitationDemandeDocument = mongoose.Document & {
  user: { cn: string; id: string; entity: string };
  role: string;
  createdAt: Date;
};
