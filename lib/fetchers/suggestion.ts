import { fetcher } from "@/lib/fetchers";
import { SuggestionDocument } from "@/models/Suggestion";
import { ResultPUT as PUT_admin_suggestion } from "@/pages/api/suggestion";
import { APIResult } from "@/types/api";

export const acceptSuggestion = async (_id: SuggestionDocument["_id"]) => {
  const res = await fetcher(`/api/suggestion`, {
    method: "PUT",
    body: JSON.stringify({ _id, action: "validate" }),
  });
  const { data: responseData, error } = (await res.json()) as APIResult<PUT_admin_suggestion>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
};

export const rejectSuggestion = async (_id: SuggestionDocument["_id"]) => {
  const res = await fetcher(`/api/suggestion`, {
    method: "PUT",
    body: JSON.stringify({ _id, action: "reject" }),
  });
  const { data: responseData, error } = (await res.json()) as APIResult<PUT_admin_suggestion>;
  // If the response is successful and there is no error, return the response data
  if (res.ok && res.status === 200 && !error) return responseData;
  // Otherwise, throw an error
  throw error;
};
