import { AdminLayout } from "@components/layouts/admin";
import { useMemo } from "react";

import { useFetch } from "@/hooks/useFetch";
import { RoleGuard } from "@/hooks/useHabilitation";
import { cn } from "@/lib/utils";
import { ResultGET } from "@/pages/api/suggestion";
import { APIResult } from "@/types/api";
import { columns_suggestions } from "@components/admin/suggestion/columns";
import { HeadTitle } from "@components/helpers/head/title";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { DataTable } from "@components/ui/data-table";
import { RefreshCwIcon } from "lucide-react";

const SuggestionsListPage = () => {
  const { data: api, loading, revalidate } = useFetch<APIResult<ResultGET>>("/api/suggestion");
  const suggestions = useMemo(() => api?.data || [], [api]);

  return (
    <RoleGuard level={100}>
      <HeadTitle title="Gestion des suggestions" />
      <AdminLayout>
        <div className="container w-full h-full overflow-x-hidden overflow-y-auto">
          <div className="flex flex-col w-full h-full gap-4 p-6 ">
            <div className="inline-flex items-center gap-x-4">
              <h1 className="inline-flex items-center gap-1 text-3xl font-bold font-title text-opengeo ">
                {"Liste des suggestions en attente"}
                <Badge variant="outline">{suggestions.length}</Badge>
              </h1>
            </div>
            <div className="ml-auto">
              <Button onClick={revalidate} disabled={loading}>
                <RefreshCwIcon className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                Rafraîchir
              </Button>
            </div>
            {!loading ? (
              <DataTable columns={columns_suggestions} data={suggestions} {...{ revalidate }} />
            ) : (
              <p>Chargement...</p>
            )}
          </div>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default SuggestionsListPage;
