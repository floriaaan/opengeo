import { Logs } from "@/types/log";
import { AdminLayout } from "@components/layouts/admin";
import { NextPage } from "next";
import { useEffect, useState } from "react";

// Pagination
import { useFetch } from "@/hooks/useFetch";
import { RoleGuard } from "@/hooks/useHabilitation";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import { Result } from "@/pages/api/logs/get";
import { APIResult } from "@/types/api";
import { HeadTitle } from "@components/helpers/head/title";
import { Button } from "@components/ui/button";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { format } from "date-fns";
import fr from "date-fns/locale/fr";
const PAGE_SIZE = 10;

/**
 * A React component that renders the logs page of the application.
 *
 * @remarks The component uses the `useFetch` hook to retrieve the logs data from the server. The component also includes the `usePagination` hook to handle pagination of the logs data. The component renders a table of logs data with pagination controls and a refresh button. The `AdminLayout` component is used to provide a layout for the page.
 *
 * @returns A React component that renders the logs page of the application.
 */
const LogsPage: NextPage = () => {
  const [url, setURL] = useState<string>(`/api/logs/get?limit=${PAGE_SIZE}&offset=0`);

  const { data: apiResult, error, loading, revalidate } = useFetch<APIResult<Result>>(url);

  const {
    currentPage,
    totalPages,
    setPage,
    setNextPage,
    setPreviousPage,
    nextEnabled,
    previousEnabled,
    startIndex,
    endIndex,
  } = usePagination({
    totalItems: apiResult?.data?.count || 0,
    initialPageSize: PAGE_SIZE,
  });

  useEffect(() => {
    setURL(`/api/logs/get?limit=${PAGE_SIZE}&offset=${startIndex}`);
  }, [currentPage, startIndex]);

  return (
    <RoleGuard level={1000}>
      <HeadTitle title="Logs" />
      <AdminLayout>
        <div className="flex flex-col w-full p-6 space-y-2">
          <div className="inline-flex items-center justify-between w-full">
            <div className="flex flex-col">
              <div className="text-2xl font-bold font-title">Logs</div>
              <div className="text-gray-600 font-public">
                {startIndex} - {endIndex > 0 ? endIndex + 1 : "Inconnu"} sur {apiResult?.data?.count || "Inconnu"}
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-2 py-2 mt-4 w-fit">
              {/* <Input placeholder="Rechercher..." /> */}
              <Button onClick={revalidate} disabled={loading} className="button-gray w-fit">
                <UpdateIcon className={cn("w-4 h-4", loading && "animate-spin")} />
                Rafraîchir
              </Button>

              <div className="inline-flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setPage(0)}
                  disabled={!previousEnabled}
                  className="px-2 button-gray w-fit"
                >
                  <DoubleArrowLeftIcon className="w-4 h-4 shrink-0" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={setPreviousPage}
                  disabled={!previousEnabled}
                  className="px-2 button-gray w-fit"
                >
                  <ChevronLeftIcon className="w-4 h-4 shrink-0" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="px-2 button-gray w-fit"
                  onClick={setNextPage}
                  disabled={!nextEnabled}
                >
                  <ChevronRightIcon className="w-4 h-4 shrink-0" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="px-2 button-gray w-fit"
                  onClick={() => setPage(totalPages - 1)}
                  disabled={!nextEnabled}
                >
                  <DoubleArrowRightIcon className="w-4 h-4 shrink-0" />
                </Button>
              </div>
            </div>
          </div>

          {!error && (
            <table className="w-full mx-auto rounded">
              <thead>
                <tr>
                  <th className="w-2/5 p-2 text-xs text-left text-gray-700 font-title">Utilisateur</th>
                  <th className="w-2/5 p-2 text-xs text-left text-gray-500 font-title">URL</th>
                  <th className="w-1/5 p-2 text-xs text-left text-gray-500 font-title">Date</th>
                </tr>
              </thead>
              <tbody className="mx-12 bg-white border-t border-gray-300 divide-y divide-gray-200 dark:bg-gray-700">
                {(apiResult?.data?.logs || []).map((el, key) => {
                  return <LogComponent {...el} key={key} />;
                })}
              </tbody>
            </table>
          )}

          {error && (
            <div className="p-12 text-center">
              <p className="text-lg font-bold text-red-600 font-title">
                Une erreur est survenue lors du chargement des données.
              </p>
              <p className="text-sm text-gray-500">Veuillez réessayer ultérieurement.</p>
            </div>
          )}
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

const LogComponent = ({ method, path, user, timestamp }: Logs) => {
  return (
    <tr className="bg-white border-b last:border-b-0 ">
      <td className="px-4 py-2">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 text-sm rounded-md shrink-0 bg-opengeo-100 text-opengeo-600">
            <span>{user?.cn.split(" ").map((w) => w[0])}</span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900 font-public ">{user?.cn}</div>
            <div className="text-xs text-gray-500 font-title">{user?.id}</div>
          </div>
        </div>
      </td>

      <td className="">
        <div className="flex flex-col gap-1 ">
          <span className="inline-flex items-center leading-none gap-x-1">
            <span
              className={cn(
                "flex items-center justify-center  text-xs font-bold rounded-full h-4 min-w-[2.5rem] px-1 text-[0.6rem] font-title",
                method === "GET" || method === "HEAD" || method === "OPTIONS" || !method
                  ? "text-green-800 bg-green-100"
                  : "text-red-800 bg-red-100",
              )}
            >
              {method || "GET"}
            </span>
            {path.includes("api") ? (
              <span
                className={cn(
                  "flex items-center justify-center h-4 min-w-[2.5rem] px-0.5 text-[0.6rem] text-xs font-bold  rounded-sm font-title",
                  path.split("/")[2] === "v2" ? "bg-yellow-50 text-amber-600" : "text-gray-800 bg-gray-100",
                )}
              >
                API
              </span>
            ) : (
              <span className="flex items-center justify-center h-4 w-10 text-[0.6rem] font-bold text-blue-600 bg-blue-50 rounded-full  font-title">
                PAGE
              </span>
            )}
          </span>
          <span className="max-w-[12rem] md:max-w-[16rem] lg:max-w-md xl:max-w-xl text-[0.7rem] ml-2 font-medium text-gray-600 truncate font-public">
            {path}
          </span>
        </div>
      </td>
      <td className="px-2 text-sm text-gray-500">
        {format(new Date(timestamp), "dd MMM yyyy - HH:mm:ss", { locale: fr })}
      </td>
    </tr>
  );
};

export default LogsPage;
