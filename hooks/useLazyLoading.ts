import { useCallback, useEffect, useState } from "react";

export function useLazyLoading<T = unknown>(minified: T, fetcher: Promise<T> | (() => Promise<T>)) {
  const [data, setData] = useState<T>(minified);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchData = useCallback(
    async function () {
      setIsError(false);
      setIsLoading(true);
      try {
        const result = typeof fetcher === "function" ? await fetcher() : await fetcher;
        setData(result);
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    },
    [fetcher],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError };
}
