export type APIResult<T> =
  | {
      data: T;
      error: null;
    }
  | { data: null; error: APIError };

export type APIError = {
  message: string;
};
