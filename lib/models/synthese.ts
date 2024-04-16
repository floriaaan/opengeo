import { deepEqual } from "@/lib/deep-equal";
import { UserMinimum } from "@/types/global";
import { SyntheseMetadata, SyntheseType } from "@/types/synthese";

export const sortByName = (a: Pick<SyntheseType, "metadata">, b: Pick<SyntheseType, "metadata">) =>
  a.metadata.reference.localeCompare(b.metadata.reference);

export const filterByCreator = (o: SyntheseType, id?: UserMinimum["id"]) =>
  o.metadata.created_by?.id === id || o.metadata.updated_by?.id === id;

export const search = (o: SyntheseType, search: string) =>
  o.metadata.reference.toLowerCase().includes(search.toLowerCase()) ||
  o.metadata.label.toLowerCase().includes(search.toLowerCase());

export type Difference = {
  path: string;
  initialValue: any;
  value: any;
};

/**
 * Should return the difference between two objects for every property recursively.
 *
 *
 *
 * @param a - The first object to compare
 * @param b - The second object to compare
 */
export const getDifference = (a: SyntheseType, b: SyntheseType, path: string = ""): Difference[] => {
  const diff = [];

  // Compare _id
  if (!deepEqual(a._id.toString(), b._id.toString())) {
    diff.push({
      path: `${path}._id`,
      initialValue: a._id,
      value: b._id,
    });
  }

  // Compare metadata
  for (const key in a.metadata) {
    if (!deepEqual(a.metadata[key as keyof SyntheseMetadata], b.metadata[key as keyof SyntheseMetadata])) {
      diff.push({
        path: `${path}.metadata.${key}`,
        initialValue: a.metadata[key as keyof SyntheseMetadata],
        value: b.metadata[key as keyof SyntheseMetadata],
      });
    }
  }

  // Compare children

  return diff;
};
