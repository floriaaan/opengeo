import { ChangeEvent, useEffect, useState } from "react";

/**
 * A custom hook that provides search functionality for an array of objects.
 *
 * @remarks The hook takes two arguments: `key`, which is the property of the objects to search on, and `items`, which is the array of objects to search through. The hook returns an object with properties that describe the current search state, as well as a function to update the state. The hook uses the `useState` and `useEffect` hooks from the `react` library to manage the state and behavior of the search functionality.
 *
 * @param key - The property of the objects to search on. (key is aware of properties on the object, ex: "name" in items = [{ name: "John Doe" }])
 * @param items - The array of objects to search through.
 *
 * @returns An object with properties that describe the current search state, as well as a function to update the state.
 *
 * @example
 * const { search, onChange, filtered } = useSearch("name", items);
 */
export function useSearch<T = object>(key: keyof T, items: T[]) {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<T[]>(items);

  // if the 'items' change, make sure we update our state.
  useEffect(() => {
    if (items.length > 0) setFiltered(items);
  }, [items]);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearch(value);

    // if there's no hits found, set filtered back to all items
    if (value.length <= 0) {
      setFiltered(items);

      // else, search on the provided 'key'
    } else {
      setFiltered(
        items.filter((v) => (v[key] as unknown as string).toString().toLowerCase().includes(value.toLowerCase())),
      );
    }
  }

  return {
    search,
    onChange,
    filtered,
  };
}
