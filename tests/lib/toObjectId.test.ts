import { Types } from "mongoose";
import { toObjectId } from "@/lib/mongo/toObjectId";
import { test, expect } from "vitest";

test("should throw an error when str is not provided", () => {
  expect(() => toObjectId(undefined as unknown as string)).toThrow("str is required");
});

it("should return a valid ObjectId when a valid string is provided", () => {
  const idString = "5f8c6d3f6d9b8a1c3c8e6d1f";
  const result = toObjectId(idString);
  expect(result).toBeInstanceOf(Types.ObjectId);
  expect(result.toString()).toEqual(idString);
});

it("should throw an error when an invalid string is provided", () => {
  const invalidIdString = "invalid-id-string";
  expect(() => toObjectId(invalidIdString)).toThrow();
});
