import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetch } from "@/hooks/useFetch";
import { RoleGuard } from "@/hooks/useHabilitation";
import { APIResult } from "@/types/api";
import { SubObjectTemplate } from "@/types/generic-object";
import { TemplateRow } from "@components/admin/template-row";
import { HeadTitle } from "@components/helpers/head/title";
import { AdminLayout } from "@components/layouts/admin";
import { LargeLoader } from "@components/ui/loader/large";
import { regions_obj as regions } from "@resources/regions";
import { useEffect, useMemo, useState } from "react";

/**
 * A React component that renders a page for displaying the details of a all site for super-administation.
 *
 * @remarks The component takes one props: `genericObjects`, which is an array of all `GenericObject`s.
 *
 * @param genericObjects - An array of all `GenericObject`s.
 *
 * @returns A React component that renders a page for displaying the details of all site.
 */
const SuperAdminTemplatePage = () => {
  const {
    data: api_obj,
    loading,
    revalidate,
  } = useFetch<APIResult<SubObjectTemplate[]>>("/api/sub-object/template/get");
  const obj = useMemo(() => api_obj?.data || [], [api_obj]);

  const [region, setRegion] = useState("");
  const [objects, setObjects] = useState<SubObjectTemplate[]>(obj);

  useEffect(() => {
    if (region.trim()) setObjects(obj.filter((o) => o.entity === region));
    else setObjects(obj);
  }, [region, obj]);

  return (
    <RoleGuard level={1000}>
      <HeadTitle title="Gestion des modèles (toutes entités)" />

      <AdminLayout>
        <div className="w-full mx-auto max-w-7xl max-h-[calc(100vh-4rem-3rem)] h-full overflow-x-hidden overflow-y-auto">
          <div className="flex flex-col w-full h-full gap-4 p-6 ">
            <div className="inline-flex items-center gap-x-4">
              <h1 className="inline-flex items-center text-3xl font-bold font-title text-opengeo ">
                Gestion des Modèles
              </h1>
              <span className="px-3 py-1 mt-1 text-xs font-bold text-white flex-nowrap w-fit rounded-2xl bg-opengeo font-title">
                {objects.length}
              </span>
            </div>

            <div className="flex flex-row items-center">
              <p className="mr-3 text-sm text-gray-500">Filtrer par région :</p>
              <Select onValueChange={setRegion} defaultValue={regions[0].value}>
                <SelectTrigger className="w-1/3">
                  <SelectValue placeholder="Sélectionner une région" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(
                    ({ value, label }) =>
                      value !== "" && (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {!loading ? (
              objects.map((el) => {
                return <TemplateRow key={el._id} {...el} revalidate={revalidate}></TemplateRow>;
              })
            ) : (
              <LargeLoader />
            )}
          </div>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default SuperAdminTemplatePage;
