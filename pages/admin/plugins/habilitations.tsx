import { AdminLayout } from "@components/layouts/admin";
import { useMemo } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useFetch } from "@/hooks/useFetch";
import { RoleGuard } from "@/hooks/useHabilitation";
import { cn } from "@/lib/utils";
import { ResultGET } from "@/pages/api/admin/habilitation";
import { APIResult } from "@/types/api";
import { columns_habilitation, columns_habilitationDemande } from "@components/habilitations/admin/columns";
import { HeadTitle } from "@components/helpers/head/title";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { DataTable } from "@components/ui/data-table";
import { ReloadIcon } from "@radix-ui/react-icons";

const HabilitationsListPage = () => {
  const { data: api, loading, revalidate } = useFetch<APIResult<ResultGET>>("/api/admin/habilitation");
  const objects = useMemo(() => api?.data || { actives: [], demandes: [] }, [api]);

  return (
    <RoleGuard level={100}>
      <HeadTitle title="Gestion des habilitations" />
      <AdminLayout>
        <div className="container w-full h-full mx-auto overflow-x-hidden overflow-y-auto">
          <div className="flex flex-col w-full h-full gap-4 p-6 ">
            <div className="inline-flex items-center gap-x-4">
              <h1 className="inline-flex items-center text-3xl font-bold font-title text-opengeo ">
                Gestion des habilitations
              </h1>
            </div>

            <Tabs defaultValue="actives">
              <div className="inline-flex justify-between w-full gap-2">
                <TabsList>
                  <TabsTrigger value="actives" className="inline-flex gap-2">
                    {"Liste des habilitations actives"}
                    <Badge variant="outline">{objects.actives.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="demandes" className="inline-flex gap-2">
                    {"Liste des demandes d'habilitations"}
                    <Badge variant={objects.demandes.length > 0 ? "destructive" : undefined}>
                      {objects.demandes.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
                <Button onClick={revalidate} disabled={loading}>
                  <ReloadIcon className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                  Rafraîchir
                </Button>
              </div>
              <TabsContent value="actives">
                {!loading ? (
                  <DataTable columns={columns_habilitation} data={objects.actives} {...{ revalidate }} />
                ) : (
                  <p>Chargement...</p>
                )}
              </TabsContent>
              <TabsContent value="demandes">
                {!loading ? (
                  <DataTable columns={columns_habilitationDemande} data={objects.demandes} {...{ revalidate }} />
                ) : (
                  <p>Chargement...</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default HabilitationsListPage;
