import { BASE_HEADERS, HOST_URL, fetcher } from "@/lib/fetchers";
import { Field } from "@/types/generic-object";

import { sortByName } from "@/lib/models/sub-object";
import { SubObjectType } from "@/models";
import { Result as CreateResult } from "@/pages/api/sub-object/create";
import { Result as DeleteResult } from "@/pages/api/sub-object/delete";
import { Result as GetResult } from "@/pages/api/sub-object/get";
import { Result as UpdateResult } from "@/pages/api/sub-object/update";
import { APIResult } from "@/types/api";
import { SubObjectMetadata } from "@/types/global";
import { SubObjectFlags } from "@/types/sub-object";

// This function retrieves all sub-objects from the server
export async function getAllSubObject() {
  const res = await fetcher(`${HOST_URL}/api/sub-object/get`, {
    method: "GET",
    headers: BASE_HEADERS,
  });

  const { data, error } = (await res.json()) as APIResult<GetResult>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return ((data as SubObjectType[]) || []).sort(sortByName);
  // Otherwise, throw an error
  throw error;
}

export async function getAllSubObjectWithSelectedProperties(select: string) {
  const res = await fetcher(`${HOST_URL}/api/sub-object/get?select=${select}`, {
    method: "GET",
    headers: BASE_HEADERS,
  });

  const { data, error } = (await res.json()) as APIResult<GetResult>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return data as SubObjectType[];
  // Otherwise, throw an error
  throw error;
}

// This function retrieves all subobjects with a specific entity from the server
export async function getAllSubObjectsWithEntity(entity: string) {
  const res = await fetch(`${HOST_URL}/api/sub-object/get?entity=${entity}`, {
    method: "GET",
    headers: BASE_HEADERS,
    credentials: "include",
  });
  const { data, error } = (await res.json()) as APIResult<GetResult>;
  if (res.ok && res.status === 200 && !error) return ((data as SubObjectType[]) || []).sort(sortByName);
  throw error;
}

// This function retrieves a single sub-object from the server by ID
export async function getOneSubObjectWithId(id: string) {
  let query = `${HOST_URL}/api/sub-object/get?id=` + id;
  const res = await fetcher(query, {
    method: "GET",
    headers: BASE_HEADERS,
  });
  const { data, error } = (await res.json()) as APIResult<GetResult>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return data as SubObjectType;
  // Otherwise, throw an error
  throw error;
}

// This function retrieves a single sub-object from the server by name
export async function getOneSubObjectWithName(name: string) {
  let query = `${HOST_URL}/api/sub-object/get?name=` + name;
  const res = await fetcher(query, {
    method: "GET",
    headers: BASE_HEADERS,
  });
  const { data, error } = (await res.json()) as APIResult<GetResult>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return data as SubObjectType;
  // Otherwise, throw an error
  throw error;
}

// This function creates a new sub-object on the server

export async function createSubObject(metadata: SubObjectMetadata, data: Field[], flags?: SubObjectFlags) {
  const res = await fetcher(`${HOST_URL}/api/sub-object/create`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify({ metadata, data, flags }),
  });
  const { data: responseData, error } = (await res.json()) as APIResult<CreateResult>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 201 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
}

// This function updates an existing sub-object on the server by ID
export async function updateSubObjectWithId(_id: string, metadata: SubObjectMetadata, data: Field[]) {
  const res = await fetcher(`${HOST_URL}/api/sub-object/update`, {
    method: "PUT",
    headers: BASE_HEADERS,
    body: JSON.stringify({ metadata, data, _id }),
  });
  const { data: responseData, error } = (await res.json()) as APIResult<UpdateResult>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
}

// This function deletes an existing sub-object on the server by ID
export async function deleteSubObjectWithId(id: string) {
  const d = { id: id };
  const res = await fetcher(`${HOST_URL}/api/sub-object/delete`, {
    method: "DELETE",
    headers: BASE_HEADERS,
    body: JSON.stringify(d),
  });
  const { data: responseData, error } = (await res.json()) as APIResult<DeleteResult>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
}
