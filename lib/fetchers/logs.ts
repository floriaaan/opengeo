import { BASE_HEADERS, HOST_URL, fetcher } from "@/lib/fetchers";
import { APIResult } from "@/types/api";
import { Log } from "@/types/log";

import { Result as CreateResult } from "@/pages/api/logs/create";

// This function retrieves all logs from the server
export async function getLogs() {
  const res = await fetcher(`${HOST_URL}/api/logs/get`, {
    method: "GET",
    headers: BASE_HEADERS,
  });

  const { data, error } = (await res.json()) as APIResult<CreateResult[]>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return data as Log[];
  // Otherwise, throw an error
  throw error;
}
