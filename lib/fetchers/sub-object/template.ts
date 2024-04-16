import { BASE_HEADERS, HOST_URL, fetcher } from "@/lib/fetchers";
import { APIResult } from "@/types/api";
import { GenericObject, SubObjectTemplate } from "@/types/generic-object";

import { Result as ResultCreate } from "@/pages/api/sub-object/template/create";
import { Result as ResultGet } from "@/pages/api/sub-object/template/get";
import { Result as ResultUpdate } from "@/pages/api/sub-object/template/update";

// GET ALL WITHOUT CONDITIONS
export async function getAllTemplateSubObject() {
  const res = await fetcher(`${HOST_URL}/api/sub-object/template/get`, {
    method: "GET",
    headers: BASE_HEADERS,
  });

  const { data, error } = (await res.json()) as APIResult<ResultGet>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return data as SubObjectTemplate[];
  // Otherwise, throw an error
  throw error;
}

// GET ALL WITH ENTITY
export async function getAllTemplateSubObjectWithEntity(entity: string) {
  const res = await fetcher(`${HOST_URL}/api/sub-object/template/get?entity=${entity}`, {
    method: "GET",
    headers: BASE_HEADERS,
  });
  const { data, error } = (await res.json()) as APIResult<ResultGet>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return data as SubObjectTemplate[];
  // Otherwise, throw an error
  throw error;
}

export async function createTemplateSubObject(
  values: { [key: string]: GenericObject[] },
  label: string,
  entity: string,
) {
  const d = { label: label, entity: entity, data: values };
  const res = await fetcher(`${HOST_URL}/api/sub-object/template/create`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify(d),
  });
  const { data: responseData, error } = (await res.json()) as APIResult<ResultCreate>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
}

export async function updateTemplateSubObject(values: { [key: string]: GenericObject[] }, id: string, entity: string) {
  const d = { id: id, values: values, entity: entity };
  // Logique update ici
  const res = await fetcher(`${HOST_URL}/api/sub-object/template/update`, {
    method: "PUT",
    headers: BASE_HEADERS,
    body: JSON.stringify(d),
  });
  const { data: responseData, error } = (await res.json()) as APIResult<ResultUpdate>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
}

export async function deleteTemplateSubObject(id: string) {
  const d = { id: id };
  const res = await fetcher(`${HOST_URL}/api/sub-object/template/delete`, {
    method: "DELETE",
    headers: BASE_HEADERS,
    body: JSON.stringify(d),
  });
  const { data: responseData, error } = (await res.json()) as APIResult<ResultUpdate>;
  // If the response is successful and there is no error, return the data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
}
