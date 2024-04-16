import { GenericField, GenericFieldValue, GenericMetadata } from "@/types/generic-object";
import { UserMinimum } from "@/types/global";

export type HistoryMetadata = GenericMetadata & {
  created_by: UserMinimum;
  type: "create" | "update" | "delete";
};

export type HistoryValue =
  | {
      label: "path";
      value: string;
      type: "string";
    }
  | {
      label: "initialValue";
      value: GenericFieldValue;
      type: GenericField["type"];
    }
  | {
      label: "value";
      value: GenericFieldValue;
      type: GenericField["type"];
    }
  | {
      label: "affectedCount";
      value: number;
      type: "number";
    }
  | {
      label: "affectedPaths";
      value: string[];
      type: "array";
    };

export type HistoryType = {
  _id: string;
  metadata: HistoryMetadata;
  values: HistoryValue[];
};
