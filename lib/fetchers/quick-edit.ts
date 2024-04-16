import { BASE_HEADERS, HOST_URL, fetcher } from "@/lib/fetchers";
import { Result } from "@/pages/api/quick-edit";
import { APIResult } from "@/types/api";
import { GenericObject } from "@/types/generic-object";

/**
 * A function that sends a POST request to update or create multiple `GenericObject` documents in the database.
 *
 * @remarks The function takes an array of `GenericObject` objects as input and sends a POST request to the `/api/quick-edit` endpoint with the objects in the request body. If the response is successful and there is no error, the function returns the data from the response. Otherwise, it throws an error with the error details.
 *
 * @param objects An array of `GenericObject` objects to update or create in the database.
 *
 * @returns The data from the response as a `Result` object.
 * @throws An error with the error details if the response is not successful or there is an error.
 */
export async function quickEdit(objects: GenericObject[]) {
  const res = await fetcher(`${HOST_URL}/api/quick-edit`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify(objects),
  });

  const { data, error } = (await res.json()) as APIResult<Result>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return data;
  // Otherwise, throw an error
  throw error;
}
