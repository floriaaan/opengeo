import { APIResult } from "@/types/api";
import { DeleteResult } from "mongodb";
import { BASE_HEADERS, HOST_URL, fetcher } from ".";

export async function deleteAllCollections() {
  const res = await fetcher(`${HOST_URL}/api/_/drop-database`, {
    method: "DELETE",
    headers: BASE_HEADERS,
  });
  // Parse the response data
  const { data: responseData, error } = (await res.json()) as APIResult<DeleteResult>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 201 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
}
