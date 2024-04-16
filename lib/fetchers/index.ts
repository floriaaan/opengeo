import { User } from "@/types/user";

// This constant defines the base URL for the server API
export const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";

// This constant defines the base headers for API requests
export const BASE_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export const fetcher = (
  url: RequestInfo | URL,
  options?: RequestInit | undefined,
  _user: User | undefined = undefined,
): Promise<Response> => {
  // Removed because of use of middleware.ts
  // if (!!user && !url.toString().includes("revalidate=")) log(user, url.toString(), options?.method || "GET");
  return fetch(url, { ...options, headers: { ...BASE_HEADERS, ...options?.headers } });
};
