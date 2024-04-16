export type GenericObject = {
  _id: string;
  metadata: GenericObjectMetadata;
  values: GenericField[];
  children: { [key: string]: GenericObject[] }; // Permet d'avoir une multitude d'objets du même domaine. par exemple pour la restauration
};

export type GenericMetadata = {
  label: string;
  entity: string;
  authorization: Role;
  created_at: Date | string;
  created_by?: UserMinimum;
  updated_at: Date | string;
  updated_by?: UserMinimum;
};

export type GenericFieldValue =
  | string
  | number
  | boolean
  | [string, string] // Coordonnées GPS.
  | UploadFile; // Fichier uploadé.

export type GenericField = {
  label: string;
  type: string;
  value: GenericFieldValue;
};

// Pour les domaines/subObjects car pas de champs "value" à spécifier
export type Field = {
  label: string;
  type: string;
};

import { roles } from "@/components/habilitations/roles";
import { FileDocument } from "@/models/File";
import { UserMinimum } from "@/types/global";
type Role = (typeof roles)[number]["value"];

export type UploadFile = Pick<FileDocument, "name" | "createdAt" | "createdBy" | "path" | "size" | "type">;

// Type pour les templates des childrens/domaines
export type SubObjectTemplate = {
  _id: string;
  entity: string;
  label: string;
  created_at: Date;
  updated_at: Date;
  values: { [key: string]: GenericObject[] };
};

export type GenericObjectMetadata = GenericMetadata & {
  description?: string;
  color?: string;
};
