/**
 * Implementation of lodash.get function.
 * This function retrieves the value at the given path of the object.
 *
 * @param {Record<string, any>} obj - The object to query.
 * @param {string | string[]} query - The path of the property to get.
 * @param {any} [defaultVal=null] - The value returned for undefined resolved values.
 * @returns {any} - Returns the resolved value.
 */
export function _get(obj: Record<string, any>, query: string | string[], defaultVal: any = null): any {
  if (typeof query === "string") {
    query = query.split(/(?=\[)|\./g); // split on periods and square brackets
  }
  let key = query[0].replace(/\[|\]|"|'/g, ""); // remove square brackets and quotes
  if (!(key in obj)) {
    return defaultVal;
  }
  obj = obj[key];
  if (obj && query.length > 1) {
    return _get(obj, query.slice(1), defaultVal);
  }
  return obj;
}

/**
 * Implementation of lodash.set function.
 * This function sets the value at the given path of the object.
 *
 * @param {Record<string, any>} obj - The object to modify.
 * @param {string | string[]} query - The path of the property to set.
 * @param {any} value - The value to set.
 * @returns {Record<string, any>} - Returns the updated object.
 */
export function _set(obj: Record<string, any>, query: string | string[], value: any): Record<string, any> {
  if (typeof query === "string") {
    query = query.split(/(?=\[)|\./g); // split on periods and square brackets
  }
  let key = query[0].replace(/\[|\]|"|'/g, ""); // remove square brackets and quotes
  if (query.length > 1) {
    if (!(key in obj)) {
      obj[key] = {};
    }
    _set(obj[key], query.slice(1), value);
  } else {
    obj[key] = value;
  }
  return obj;
}
