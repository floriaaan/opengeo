import { cn } from "@/lib/utils";
import { expect, test } from "vitest";

test("should return an empty string when no arguments are provided", () => {
  const result = cn();
  expect(result).toEqual("");
});

test("should return a single class name when one argument is provided", () => {
  const result = cn("foo");
  expect(result).toEqual("foo");
});

test("should return multiple class names when multiple arguments are provided", () => {
  const result = cn("foo", "bar", "baz");
  expect(result).toEqual("foo bar baz");
});

test("should ignore falsy values", () => {
  const result = cn("foo", null, undefined, false, "bar");
  expect(result).toEqual("foo bar");
});

test("should handle boolean values", () => {
  const result = cn("foo", true, "bar", false, "baz");
  expect(result).toEqual("foo bar baz");
});
