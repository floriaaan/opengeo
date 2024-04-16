import { deepEqual } from "@/lib/deep-equal";
import { GenericMetadata, GenericObject as GenericObjectType } from "@/types/generic-object";
import { UserMinimum } from "@/types/global";

export const sortByName = (a: Pick<GenericObjectType, "values">, b: Pick<GenericObjectType, "values">) =>
  ((a.values.find((v) => v.label === "Nom")?.value as string) || "").localeCompare(
    (b.values.find((v) => v.label === "Nom")?.value as string) || "",
  );

export const filterByCreator = (o: GenericObjectType, id?: UserMinimum["id"]) =>
  o.metadata.created_by?.id === id || o.metadata.updated_by?.id === id;

export const search = (o: GenericObjectType, search: string) =>
  o.values.some((v) => v.value.toString().toLowerCase().includes(search.toLowerCase()));

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
export const getDifference = (a: GenericObjectType, b: GenericObjectType, path: string = ""): Difference[] => {
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
    if (!deepEqual(a.metadata[key as keyof GenericMetadata], b.metadata[key as keyof GenericMetadata])) {
      diff.push({
        path: `${path}.metadata.${key}`,
        initialValue: a.metadata[key as keyof GenericMetadata],
        value: b.metadata[key as keyof GenericMetadata],
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

  // Compare children recursively
  for (const key in a.children) {
    if (b.children[key]) {
      a.children[key].forEach((child, index) => {
        if (b.children[key][index]) {
          diff.push(...getDifference(child, b.children[key][index], `${path}.children["${key}"][${index}]`));
        } else {
          diff.push({
            path: `${path}.children["${key}"][${index}]`,
            initialValue: child,
            value: undefined,
          });
        }
      });
    }
  }

  for (const key in b.children) {
    if (!a.children[key]) {
      b.children[key].forEach((child, index) => {
        diff.push({
          path: `${path}.children["${key}"][${index}]`,
          initialValue: undefined,
          value: child,
        });
      });
    }
  }

  return diff;
};

// This function converts GPS coordinates from a GenericObject to a tuple of numbers
export function convertCoordinates(elem: GenericObjectType) {
  // Find the "Coordonnées GPS" field in the GenericObject's values array
  const coordinates = elem.values.find((data) => data.label === "Coordonnées GPS")?.value as [string, string];

  if (!coordinates) throw new Error("No coordinates found");
  // Convert the coordinates to a tuple of numbers
  const parsedCoordinates = coordinates.map(Number);
  if (parsedCoordinates.some((coord) => isNaN(coord))) throw new Error("Invalid coordinates");

  // Return the tuple of numbers
  return [parsedCoordinates[0], parsedCoordinates[1]] as [number, number];
}
