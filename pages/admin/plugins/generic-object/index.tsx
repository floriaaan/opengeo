import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { RoleGuard } from "@/hooks/useHabilitation";
import { search as _search, filterByCreator, sortByName } from "@/lib/models/generic-object";
import { getEntityFromContact } from "@/lib/user";
import { cn } from "@/lib/utils";
import { APIResult } from "@/types/api";
import { GenericObject } from "@/types/generic-object";
import { GenericObjectCard } from "@components/admin/generic-object/card";
import { GenericObjectLayout } from "@components/admin/generic-object/layout";
import { HeadTitle } from "@components/helpers/head/title";
import { AdminLayout } from "@components/layouts/admin";
import { Button } from "@components/ui";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@components/ui/toggle-group";
import { PlusIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * A React component that renders the object management page for the application.
 *
 * @remarks The component uses the `getAllObjectsWithEntity` function from the `object` module to retrieve the object data from the server. The component renders a `GenericObjectLayout` component with the `objects` array as its prop, and a list of `GenericObjectCard` components as its child. The `GenericObjectCard` component is responsible for rendering the card for each object. The component also includes a link to the object creation page. The `AdminLayout` component is used to provide a layout for the page.
 *
 * @param objects - An array of `GenericObject`s representing the objects to display in the object layout.
 *
 * @returns A React component that renders the object management page for the application.
 */
const GestionObjet = () => {
  const { user } = useAuth();
  const entity = useMemo(() => getEntityFromContact(user), [user]);
  const { id: g_id } = user || {};

  const {
    data: api,
    loading,
    revalidate,
  } = useFetch<APIResult<GenericObject[]>>(`/api/generic-object/get?entity=${entity}`);
  const objects = useMemo(() => api?.data?.sort(sortByName) || [], [api]);

  const types = useMemo(() => Array.from(new Set(objects.map((o) => o.metadata.label))), [objects]);

  const [selected, setSelected] = useState("entity");
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(objects);

  const f_entity = useMemo(() => objects.filter((o) => o.metadata.entity === entity), [objects, entity]);
  const f_creator = useMemo(() => objects.filter((o) => filterByCreator(o, g_id)), [objects, g_id]);

  useEffect(() => {
    if (selected === "entity") setFiltered(f_entity);
    else if (selected === "created_by") setFiltered(f_creator);
    else if (types.includes(selected)) setFiltered(objects.filter((o) => o.metadata.label === selected));
    else setFiltered(objects);
  }, [selected, objects, f_entity, f_creator, types]);

  useEffect(() => {
    if (search.trim() !== "") setFiltered(objects.filter((o) => _search(o, search)));
  }, [search, objects]);

  return (
    <RoleGuard level={100}>
      <HeadTitle title={`Gestion des objets (${entity || "entité inconnue"})`} />
      <AdminLayout>
        <GenericObjectLayout objects={objects}>
          <div className="container flex flex-col w-full h-full gap-4">
            <div className="inline-flex items-center gap-x-4">
              <h1 className="inline-flex items-center text-3xl font-bold font-title text-opengeo ">
                Gestion des objets
              </h1>
            </div>
            <hr className="border-gray-200 " />
            <div className="flex flex-row items-center justify-between w-full gap-x-2">
              <div className="flex flex-col gap-2 md:w-full md:items-center md:justify-start md:flex-row">
                <div className="relative w-96">
                  <SearchIcon className="absolute w-4 h-4 transform -translate-y-1/2 pointer-events-none top-1/2 left-3" />
                  <Input
                    className="pl-[2.25rem]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                  />
                </div>
                <div className="hidden w-px h-full bg-neutral-100 md:block"></div>
                <ToggleGroup type="single" value={selected} onValueChange={(value) => setSelected(value)}>
                  {/* <ToggleGroupItem value="all" variant="outline">
                  Tous
                </ToggleGroupItem> */}
                  <ToggleGroupItem value="entity" variant="outline">
                    {entity || "Entité"}
                    <Badge>{f_entity.length || "0"}</Badge>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="created_by" variant="outline">
                    Créés par moi
                    <Badge variant="outline">{f_creator.length || "0"}</Badge>
                  </ToggleGroupItem>
                  {types.map((t) => (
                    <ToggleGroupItem key={t} value={t} variant="outline">
                      <span className="first-letter:uppercase">{t}</span>
                      <Badge variant="outline">{objects.filter((o) => o.metadata.label === t).length || "0"}</Badge>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <div className="inline-flex items-center gap-2">
                <Button asChild variant="outline">
                  <Link href="/admin/plugins/generic-object/create" className="inline-flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    Créer un nouvel objet
                  </Link>
                </Button>
                <Button onClick={revalidate} disabled={loading}>
                  <RefreshCwIcon className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                  Rafraîchir
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {!loading ? (
                <>
                  {filtered.map((o) => (
                    <GenericObjectCard {...o} key={o._id} isLink />
                  ))}
                </>
              ) : null}
              <Link
                href="/admin/plugins/generic-object/create"
                className="flex flex-col items-center justify-center h-32 gap-2 duration-150 border border-dashed rounded-xl group hover:border-opengeo"
              >
                <PlusIcon className="w-8 h-8 text-gray-400 duration-150 group-hover:text-opengeo" />
                <span className="text-gray-400 duration-150 group-hover:text-opengeo">Ajouter un objet</span>
              </Link>
            </div>
          </div>
        </GenericObjectLayout>
      </AdminLayout>
    </RoleGuard>
  );
};

export default GestionObjet;
