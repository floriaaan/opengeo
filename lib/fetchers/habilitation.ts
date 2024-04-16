import { BASE_HEADERS, HOST_URL, fetcher } from "@/lib/fetchers";
import { HabilitationDemandeDocument } from "@/models/Habilitation";
import {
  ResultDELETE as DELETE_admin_habilitations,
  ResultGET as GET_admin_habilitations,
  ResultPUT as PUT_admin_habilitations,
} from "@/pages/api/admin/habilitation";
import { ResultPOST as POST_create_habilitationDemande } from "@/pages/api/user/habilitation";
import { APIResult } from "@/types/api";
import { Session } from "@/types/user";
import { roles } from "@components/habilitations/roles";

export const createHabilitation = async (
  user: Pick<Session, "cn" | "id"> & { entity: string },
  role: (typeof roles)[number]["value"],
) => {
  const res = await fetcher(`${HOST_URL}/api/user/habilitation`, {
    method: "POST",
    headers: BASE_HEADERS,
    body: JSON.stringify({
      user: {
        cn: user.cn,
        id: user.id,
        entity: user.entity,
      },
      role,
    }),
  });
  const { data: responseData, error } = (await res.json()) as APIResult<POST_create_habilitationDemande>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 201 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
};

export const seedHabilitations = async () => {
  const res = await fetcher(`${HOST_URL}/api/_/seed-habilitations.company`, {
    method: "POST",
    headers: BASE_HEADERS,
  });
  const { data: responseData, error } = (await res.json()) as APIResult<POST_create_habilitationDemande>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 201 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
};

export const getAllHabilitations = async () => {
  const res = await fetcher(`${HOST_URL}/api/admin/habilitation`, {
    method: "GET",
    headers: BASE_HEADERS,
  });
  const { data: responseData, error } = (await res.json()) as APIResult<GET_admin_habilitations>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
};

export const acceptHabilitationDemande = async (habilitationId: HabilitationDemandeDocument["_id"]) => {
  const res = await fetcher(`${HOST_URL}/api/admin/habilitation`, {
    method: "PUT",
    headers: BASE_HEADERS,
    body: JSON.stringify({ _id: habilitationId, action: "accept" }),
  });
  const { data: responseData, error } = (await res.json()) as APIResult<PUT_admin_habilitations>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
};

export const deleteHabilitationDemande = async (habilitationId: HabilitationDemandeDocument["_id"]) => {
  const res = await fetcher(`${HOST_URL}/api/admin/habilitation`, {
    method: "PUT",
    headers: BASE_HEADERS,
    body: JSON.stringify({ _id: habilitationId, action: "delete" }),
  });
  const { data: responseData, error } = (await res.json()) as APIResult<PUT_admin_habilitations>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
};

export const deleteHabilitation = async (habilitationId: HabilitationDemandeDocument["_id"]) => {
  const res = await fetcher(`${HOST_URL}/api/admin/habilitation`, {
    method: "DELETE",
    headers: BASE_HEADERS,
    body: JSON.stringify({ _id: habilitationId }),
  });
  const { data: responseData, error } = (await res.json()) as APIResult<DELETE_admin_habilitations>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
};
