import { useLazyLoading } from "@/hooks/useLazyLoading";
import { getAllSubObject } from "@/lib/fetchers/sub-object";
import { AdminLayout } from "@components/layouts/admin";
import { regions_obj as regions } from "@resources/regions";
import { useEffect, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleGuard } from "@/hooks/useHabilitation";
import { GenericObject } from "@/types/generic-object";
import { SubObjectCard } from "@components/admin/sub-object/card";
import { HeadTitle } from "@components/helpers/head/title";

/**
 * A React component that renders a page for displaying the details of a all site for super-administation.
 *
 * @remarks The component takes one props: `genericObjects`, which is an array of all `GenericObject`s.
 *
 * @param genericObjects - An array of all `GenericObject`s.
 *
 * @returns A React component that renders a page for displaying the details of all site.
 */
const SuperAdminAllSubObjectPage = () => {
  const { data: obj, isLoading } = useLazyLoading([], getAllSubObject);
  const [region, setRegion] = useState("");
  const [objects, setObjects] = useState(obj);

  useEffect(() => {
    if (region.trim()) setObjects(obj.filter((o) => o.metadata.entity === region));
    else setObjects(obj);
  }, [region, obj]);

  return (
    <RoleGuard level={1000}>
      <HeadTitle title="Gestion des sous-objets (toutes entités)" />
      <AdminLayout>
        <div className="w-full mx-auto max-w-7xl max-h-[calc(100vh-4rem-3rem)] h-full overflow-x-hidden overflow-y-auto">
          <div className="flex flex-col w-full h-full gap-4 p-6 ">
            <div className="inline-flex items-center gap-x-4">
              <h1 className="inline-flex items-center text-3xl font-bold font-title text-opengeo ">
                Gestion des sous-objets
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

            {!isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
                {(objects as unknown as GenericObject[]).map((object) => (
                  <SubObjectCard {...object} key={object._id} />
                ))}
              </div>
            ) : (
              <p>Chargement...</p>
            )}
          </div>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default SuperAdminAllSubObjectPage;
