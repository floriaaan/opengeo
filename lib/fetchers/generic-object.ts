import { BASE_HEADERS, HOST_URL, fetcher } from "@/lib/fetchers";
import { GenericField, GenericObject, GenericObjectMetadata } from "@/types/generic-object";

import { APIResult } from "@/types/api";

import { sortByName } from "@/lib/models/generic-object";
import { Result as CreateResult } from "@/pages/api/generic-object/create";
import { Result as DeleteResult } from "@/pages/api/generic-object/delete";
import { Result as GetResult } from "@/pages/api/generic-object/get";
import { Result as UpdateResult } from "@/pages/api/generic-object/update";

// This function retrieves all generic objects from the server
export async function getAllObjects() {
  const res = await fetch(`${HOST_URL}/api/generic-object/get`, {
    method: "GET",
    headers: BASE_HEADERS,
  });

  const { data, error } = (await res.json()) as APIResult<GetResult>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return ((data || []) as unknown as GenericObject[]).sort(sortByName);
  // Otherwise, throw an error
  throw error;
}

export async function getAllObjectsWithSelectedProperties(select: string) {
  const res = await fetcher(`${HOST_URL}/api/generic-object/get?select=${select}`, {
    method: "GET",
    headers: BASE_HEADERS,
  });

  const { data, error } = (await res.json()) as APIResult<GetResult>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return ((data || []) as unknown as GenericObject[]).sort(sortByName);
  // Otherwise, throw an error
  throw error;
}

// This function retrieves all generic objects with a specific entity from the server
export async function getAllObjectsWithEntity(entity: string) {
  const res = await fetcher(`${HOST_URL}/api/generic-object/get?entity=${entity}`, {
    method: "GET",
    headers: BASE_HEADERS,
  });
  const { data, error } = (await res.json()) as APIResult<GetResult>;
  if (res.ok && res.status === 200 && !error) return ((data || []) as unknown as GenericObject[]).sort(sortByName);
  throw error;
}

// This function retrieves a single generic object with a specific ID from the server
export async function getOneObjectWithId(id: string) {
  const res = await fetcher(`${HOST_URL}/api/generic-object/get?id=${id}`, {
    method: "GET",
    headers: BASE_HEADERS,
  });

  const { data, error } = (await res.json()) as APIResult<GetResult>;
  if (res.ok && res.status === 200 && !error) return data as unknown as GenericObject;
  throw error;
}

// This function creates a new generic object on the server
export async function createObject(
  metadata: GenericObjectMetadata,
  data: GenericField[],
  children: { [key: string]: GenericObject[] },
) {
  // Construct the object data
  // Send a POST request to the server with the object data
  const res = await fetcher(`${HOST_URL}/api/generic-object/create`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify({ metadata, data, children }),
  });
  // Parse the response data
  const { data: responseData, error } = (await res.json()) as APIResult<CreateResult>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 201 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
}

// This function updates an existing generic object on the server
export async function updateObjectWithId(
  _id: string,
  metadata: GenericObjectMetadata,
  data: GenericField[],
  children: { [key: string]: GenericObject[] },
) {
  // Construct the object data
  // Send a PUT request to the server with the object data
  const res = await fetcher(`${HOST_URL}/api/generic-object/update`, {
    method: "PUT",
    headers: BASE_HEADERS,
    body: JSON.stringify({ _id, metadata, data, children }),
  });
  // Parse the response data
  const { data: responseData, error } = (await res.json()) as APIResult<UpdateResult>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
}

// This function deletes an existing generic object on the server
export async function deleteObjectWithId(id: string) {
  // Construct the object data
  // Send a DELETE request to the server with the object data
  const res = await fetcher(`${HOST_URL}/api/generic-object/delete`, {
    method: "DELETE",
    headers: BASE_HEADERS,
    body: JSON.stringify({ id }),
  });
  // Parse the response data
  const { data: responseData, error } = (await res.json()) as APIResult<DeleteResult>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
}
