import { SubObjectType } from "@/models";
import { GenericMetadata } from "@/types/generic-object";
import { SubObjectMetadata } from "@/types/global";

export type SyntheseMetadata = Omit<GenericMetadata, "authorization"> & {
  reference: string;
};

export type SyntheseChildMetadata = SubObjectMetadata & {
  header?: string;
  footer?: string;
};

export type SyntheseChild = {
  _id: string;
  metadata: SubObjectMetadata;
  values?: SubObjectType["values"];
  // we'll get the values from the sub-object itself
  // each values will be get by deep get with the path `children[metadata.label][number].values`
};

export type SyntheseType = {
  _id: string;
  metadata: SyntheseMetadata;
  children: SyntheseChild[];
};
