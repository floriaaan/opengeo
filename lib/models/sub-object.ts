import { deepEqual } from "@/lib/deep-equal";
import { SubObjectType } from "@/models";
import { SubObjectMetadata } from "@/types/global";

export const sortByName = (a: Pick<SubObjectType, "metadata">, b: Pick<SubObjectType, "metadata">) =>
  a.metadata.label.localeCompare(b.metadata.label);

export const sortByEntity = (
  a: Pick<SubObjectType, "metadata">,
  b: Pick<SubObjectType, "metadata">,
  favorite?: string,
) => {
  if (favorite) {
    if (a.metadata.entity === favorite) return -1;
    if (b.metadata.entity === favorite) return 1;
  }
  return a.metadata.entity?.localeCompare(b.metadata.entity);
};

export const getLabel = (s: SubObjectType) => {
  const label = s.metadata.label;
  if (label.split(" ").length > 1)
    return label
      .split(" ")
      .map((l, i) => (i < 3 ? l[0] : null))
      .filter((l) => l !== null)
      .join("");
  return label.slice(0, 3);
};

export const filterByCreator = (s: SubObjectType, id?: string) =>
  s.metadata.created_by?.id === id || s.metadata.updated_by?.id === id;

export const search = (s: SubObjectType, search: string) =>
  s.metadata.label.toLowerCase().includes(search.toLowerCase()) ||
  s.metadata.description?.toLowerCase().includes(search.toLowerCase());

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
export const getDifference = (a: SubObjectType, b: SubObjectType, path: string = ""): Difference[] => {
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
    if (!deepEqual(a.metadata[key as keyof SubObjectMetadata], b.metadata[key as keyof SubObjectMetadata])) {
      diff.push({
        path: `${path}.metadata.${key}`,
        initialValue: a.metadata[key as keyof SubObjectMetadata],
        value: b.metadata[key as keyof SubObjectMetadata],
      });
    }
  }

  // Compare values
  a.values.forEach((value, index) => {
    if (!deepEqual(value.value, b.values[index].value)) {
      diff.push({
        path: `${path}.values[${index}].value`,
        initialValue: value.value,
        value: b.values[index].value,
      });
    }
  });

  return diff;
};
