import { GenericMetadata, GenericObjectMetadata } from "@/types/generic-object";
import { Session } from "@/types/user";

export type SubObjectMetadata = GenericMetadata & {
  description?: string;
};

export const DEFAULT_GENERIC_OBJECT_METADATA: GenericObjectMetadata = {
  label: "site",
  entity: "",
  authorization: "PZW_USER",
  created_at: "",
  updated_at: "",
  description: "",
};

export const DEFAULT_SUB_OBJECT_METADATA: SubObjectMetadata = {
  label: "",
  entity: "",
  authorization: "PZW_USER",
  created_at: "",
  updated_at: "",
  description: "",
};

export type UserMinimum = Pick<Session, "id" | "cn"> & {
  email?: string;
  entity?: string;
};

export const GENERIC_OBJECT_MARKER_COLORS = new Map<string, string>([["site", "#1440dc"]]);
