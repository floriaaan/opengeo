import { convertCoordinates } from "@/lib/models/generic-object";
import { GenericObject } from "@/types/generic-object";
import { expect, test } from "vitest";

test("should return the correct coordinates", () => {
  const elem = {
    values: [
      { label: "Some other data", value: "foo" },
      { label: "Coordonnées GPS", value: ["48.8566", "2.3522"] },
    ],
  };
  const result = convertCoordinates(elem as GenericObject);
  expect(result).toEqual([48.8566, 2.3522]);
});

test("should throw an error if no coordinates are found", () => {
  const elem = {
    values: [{ label: "Some other data", value: "foo" }],
  };
  expect(() => convertCoordinates(elem as GenericObject)).toThrow("No coordinates found");
});

test("should throw an error if the coordinates are invalid", () => {
  const elem = {
    values: [
      { label: "Some other data", value: "foo" },
      { label: "Coordonnées GPS", value: ["foo", "bar"] },
    ],
  };
  expect(() => convertCoordinates(elem as GenericObject)).toThrow("Invalid coordinates");

  const elem2 = {
    values: [
      { label: "Some other data", value: "foo" },
      { label: "Coordonnées GPS", value: ["4", "2.35frg22"] },
    ],
  };
  expect(() => convertCoordinates(elem2 as GenericObject)).toThrow("Invalid coordinates");
});
