import { _get } from "@/lib/deep-get-set";

describe("deep get", () => {
  const testObj = {
    a: {
      b: {
        c: {
          d: 123,
        },
      },
      e: [{ f: 9 }, { g: 10 }],
    },
  };

  const testArr = [
    { id: 1, comments: [{ text: "hello" }, { text: "goodbye" }] },
    { id: 2, comments: [] },
  ];

  const falseyObj = {
    isUndefined: undefined,
    isNull: null,
    isZero: 0,
    isEmptyString: "",
  };

  it("handles nested objects", () => {
    expect(_get(testObj, "a.b.c.d")).toBe(123);
  });

  it("handles arrays inside an object", () => {
    expect(_get(testObj, "a.e[0].f")).toBe(9);
  });

  it("handles objects inside an array", () => {
    expect(_get(testArr, "[0].comments[1].text")).toBe("goodbye");
  });

  it("returns the default value if query was not found", () => {
    const defaultVal = "oh no";
    expect(_get(testObj, "invalid.not[0].found", defaultVal)).toBe(defaultVal);
  });

  it("returns falsey values, including undefined", () => {
    const defaultVal = "my default";
    expect(_get(falseyObj, "isUndefined", defaultVal)).toBe(undefined);
    expect(_get(falseyObj, "isNull", defaultVal)).toBe(null);
    expect(_get(falseyObj, "isZero", defaultVal)).toBe(0);
    expect(_get(falseyObj, "isEmptyString", defaultVal)).toBe("");
  });
});
