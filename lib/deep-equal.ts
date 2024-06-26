const cached = new WeakMap();

/**
 * @param {any} a
 * @param {any} b
 * @return {boolean}
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === null || b === null) {
    return a === b;
  }

  if (typeof a !== "object" || typeof b !== "object") {
    return a === b;
  }

  const dataTypeA = detectDataType(a);
  const dataTypeB = detectDataType(b);
  if (dataTypeA !== dataTypeB) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  const symbolsA = Object.getOwnPropertySymbols(a);
  const symbolsB = Object.getOwnPropertySymbols(b);
  if (symbolsA.length !== symbolsB.length) return false;

  if (cached.get(a)?.has(b)) return true;
  if (cached.get(b)?.has(a)) return true;

  cache(a, b, cached);

  const propertyNamesA = [...keysA, ...symbolsA];

  for (const propertyNameA of propertyNamesA) {
    if (!Object.prototype.hasOwnProperty.call(b, propertyNameA)) return false;

    const propertyValueA = a[propertyNameA];
    const propertyValueB = b[propertyNameA];

    if (!deepEqual(propertyValueA, propertyValueB)) {
      return false;
    }
  }

  return true;
}

function detectDataType(data: any) {
  if (Array.isArray(data)) return "array";
  return "object";
}

function cache(a: any, b: any, cached: WeakMap<any, Set<any>>) {
  let setForA = cached.get(a);
  if (!setForA) {
    cached.set(a, (setForA = new Set()));
  }
  setForA.add(b);

  let setForB = cached.get(b);
  if (!setForB) {
    cached.set(b, (setForB = new Set()));
  }
  setForB.add(a);
}
