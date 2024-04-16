import { useCallback, useEffect, useMemo, useRef, useReducer } from "react";

const getPreviousEnabled = (currentPage: number): boolean => currentPage > 0;

const getNextEnabled = (currentPage: number, totalPages: number): boolean => currentPage + 1 < totalPages;

const getTotalPages = (totalItems: number, pageSize: number): number => Math.ceil(totalItems / pageSize);

const getStartIndex = (pageSize: number, currentPage: number): number => pageSize * currentPage;

const getEndIndex = (pageSize: number, currentPage: number, totalItems: number): number => {
  const lastPageEndIndex = pageSize * (currentPage + 1);

  if (lastPageEndIndex > totalItems) {
    return totalItems - 1;
  }

  return lastPageEndIndex - 1;
};

const limitPageBounds =
  (totalItems: number, pageSize: number) =>
  (page: number): number =>
    Math.min(Math.max(page, 0), getTotalPages(totalItems, pageSize) - 1);

type PaginationState = {
  totalItems: number;
  pageSize: number;
  currentPage: number;
};

type PaginationMeta = {
  totalPages: number;
  startIndex: number;
  endIndex: number;
  previousEnabled: boolean;
  nextEnabled: boolean;
};

const getPaginationMeta = ({ totalItems, pageSize, currentPage }: PaginationState): PaginationMeta => {
  const totalPages = getTotalPages(totalItems, pageSize);
  return {
    totalPages,
    startIndex: getStartIndex(pageSize, currentPage),
    endIndex: getEndIndex(pageSize, currentPage, totalItems),
    previousEnabled: getPreviousEnabled(currentPage),
    nextEnabled: getNextEnabled(currentPage, totalPages),
  };
};

type UsePaginationConfig = {
  totalItems?: number;
  initialPage?: number;
  initialPageSize?: number;
};

type PaginationActions = {
  setPage: (page: number) => void;
  setNextPage: () => void;
  setPreviousPage: () => void;
  setPageSize: (pageSize: number, nextPage?: number) => void;
};

type CurrentPageActions = { type: "NEXT_PAGE" } | { type: "PREVIOUS_PAGE" } | { type: "SET_PAGE"; page: number };

type TotalItemsActions = {
  type: "SET_TOTALITEMS";
  totalItems: number;
  nextPage?: number;
};

type PageSizeActions = {
  type: "SET_PAGESIZE";
  pageSize: number;
  nextPage?: number;
};

type PaginationStateReducerActions = CurrentPageActions | TotalItemsActions | PageSizeActions;

const getCurrentPageReducer = (rootState: PaginationState) =>
  function currentPageReducer(state: PaginationState["currentPage"], action: PaginationStateReducerActions) {
    switch (action.type) {
      case "SET_PAGE":
        return limitPageBounds(rootState.totalItems, rootState.pageSize)(action.page);
      case "NEXT_PAGE":
        return limitPageBounds(rootState.totalItems, rootState.pageSize)(state + 1);
      case "PREVIOUS_PAGE":
        return limitPageBounds(rootState.totalItems, rootState.pageSize)(state - 1);
      case "SET_PAGESIZE":
        return limitPageBounds(rootState.totalItems, action.pageSize)(action.nextPage ?? state);
      case "SET_TOTALITEMS":
        return limitPageBounds(action.totalItems, rootState.pageSize)(action.nextPage ?? state);
      /* istanbul ignore next */
      default:
        return state;
    }
  };

function totalItemsReducer(state: PaginationState["totalItems"], action: TotalItemsActions) {
  switch (action.type) {
    case "SET_TOTALITEMS":
      return action.totalItems;
    default:
      return state;
  }
}

function pageSizeReducer(state: PaginationState["pageSize"], action: PageSizeActions) {
  switch (action.type) {
    case "SET_PAGESIZE":
      return action.pageSize;
    default:
      return state;
  }
}

function paginationStateReducer(state: PaginationState, action: PaginationStateReducerActions): PaginationState {
  return {
    currentPage: getCurrentPageReducer(state)(state.currentPage, action as CurrentPageActions),
    totalItems: totalItemsReducer(state.totalItems, action as TotalItemsActions),
    pageSize: pageSizeReducer(state.pageSize, action as PageSizeActions),
  };
}

/**
 * A custom hook that provides pagination functionality for a list of items.
 *
 * @remarks The hook takes an optional configuration object with three properties: `totalItems`, which is the total number of items in the list, `initialPage`, which is the initial page to display, and `initialPageSize`, which is the initial number of items per page. The hook returns an object with properties that describe the current pagination state, as well as functions to update the state. The hook uses the `useReducer`, `useCallback`, `useEffect`, and `useMemo` hooks from the `react` library to manage the state and behavior of the pagination.
 *
 * @param config - An optional configuration object with three properties: `totalItems`, `initialPage`, and `initialPageSize`.
 *
 * @returns An object with properties that describe the current pagination state, as well as functions to update the state.
 *
 * @example
 * const { currentPage, totalPages, startIndex, endIndex, previousEnabled, nextEnabled, setPage, setNextPage, setPreviousPage, setPageSize } = usePagination({
 *   totalItems: 100,
 *   initialPage: 0,
 *   initialPageSize: 10,
 * });
 */
export function usePagination({
  totalItems = 0,
  initialPage = 0,
  initialPageSize = 0,
}: UsePaginationConfig = {}): PaginationState & PaginationMeta & PaginationActions {
  const initialState = {
    totalItems,
    pageSize: initialPageSize,
    currentPage: initialPage,
  };

  const [paginationState, dispatch] = useReducer(paginationStateReducer, initialState);

  const totalItemsRef = useRef(totalItems);
  totalItemsRef.current = totalItems;

  useEffect(() => {
    return () => {
      if (typeof totalItemsRef.current !== "number" || totalItems === totalItemsRef.current) {
        return;
      }

      dispatch({ type: "SET_TOTALITEMS", totalItems: totalItemsRef.current });
    };
  }, [totalItems]);

  return {
    ...paginationState,
    ...useMemo(() => getPaginationMeta(paginationState), [paginationState]),
    setPage: useCallback((page: number) => {
      dispatch({
        type: "SET_PAGE",
        page,
      });
    }, []),
    setNextPage: useCallback(() => {
      dispatch({ type: "NEXT_PAGE" });
    }, []),
    setPreviousPage: useCallback(() => {
      dispatch({ type: "PREVIOUS_PAGE" });
    }, []),
    setPageSize: useCallback((pageSize: number, nextPage = 0) => {
      dispatch({ type: "SET_PAGESIZE", pageSize, nextPage });
    }, []),
  };
}
