import { useAuth } from "@/hooks/useAuth";
import { RoleGuard } from "@/hooks/useHabilitation";
import { search as _search, filterByCreator } from "@/lib/models/sub-object";
import { getEntityFromContact } from "@/lib/user";
import { cn } from "@/lib/utils";
import { SubObjectCard } from "@components/admin/sub-object/card";
import { SubObjectLayout, useSubObjects } from "@components/admin/sub-object/layout";
import { HeadTitle } from "@components/helpers/head/title";
import { AdminLayout } from "@components/layouts/admin";
import { Button } from "@components/ui";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@components/ui/toggle-group";
import { MagnifyingGlassIcon, PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * A React component that renders the sub-object management page for the application.
 *
 * @remarks The component uses the `getAllSubObject` function from the `subObject` module to retrieve the sub-object data from the server. The component renders a `SubObjectLayout` component with the `subObjects` array as its prop, and a list of `SubObjectCard` components for each sub-object. The `SubObjectCard` component is responsible for rendering the details of a sub-object. The component also includes a link to the sub-object creation page. The `AdminLayout` component is used to provide a layout for the page.
 *
 * @param subObjects - An array of `GenericObject`s representing the sub-objects to display in the sub-object layout.
 *
 * @returns A React component that renders the sub-object management page for the application.
 */
const SubObjectIndexPage = () => {
  return (
    <RoleGuard level={100}>
      <HeadTitle title={`Gestion des sous-objets`} />

      <AdminLayout>
        <SubObjectLayout>
          <SubObjectIndex />
        </SubObjectLayout>
      </AdminLayout>
    </RoleGuard>
  );
};

export default SubObjectIndexPage;

const SubObjectIndex = () => {
  const { subObjects, loading, revalidate } = useSubObjects();
  const { user } = useAuth();
  const entity = getEntityFromContact(user);
  const { id: g_id } = user || {};

  const [selected, setSelected] = useState("entity");
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(subObjects);

  const f_entity = useMemo(() => subObjects.filter((o) => o.metadata.entity === entity), [subObjects, entity]);
  const f_creator = useMemo(() => subObjects.filter((s) => filterByCreator(s, g_id)), [subObjects, g_id]);

  useEffect(() => {
    if (selected === "entity") setFiltered(f_entity);
    else if (selected === "created_by") setFiltered(f_creator);
    else setFiltered(subObjects);
  }, [selected, subObjects, f_entity, f_creator]);

  useEffect(() => {
    if (search.trim() !== "") setFiltered(subObjects.filter((s) => _search(s, search)));
  }, [search, subObjects]);

  return (
    <div className="container flex flex-col w-full h-full gap-4">
      <div className="inline-flex items-center gap-x-4">
        <h1 className="inline-flex items-center text-3xl font-bold font-title text-opengeo ">
          Gestion des sous-objets
        </h1>
      </div>
      <hr className="border-gray-200 " />
      <div className="flex flex-row items-center justify-between w-full gap-x-2">
        <div className="flex flex-col gap-2 md:w-full md:items-center md:justify-start md:flex-row">
          <div className="relative w-96">
            <MagnifyingGlassIcon className="absolute w-4 h-4 transform -translate-y-1/2 pointer-events-none top-1/2 left-3" />
            <Input
              className="pl-[2.25rem]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
            />
          </div>
          <div className="hidden w-px h-full bg-neutral-100 md:block"></div>
          <ToggleGroup type="single" value={selected} onValueChange={(value) => setSelected(value)}>
            <ToggleGroupItem value="all" variant="outline">
              Tous
              <Badge>{subObjects.length || "0"}</Badge>
            </ToggleGroupItem>
            <ToggleGroupItem value="entity" variant="outline">
              {entity || "Entité"}
              <Badge variant="outline">{f_entity.length || "0"}</Badge>
            </ToggleGroupItem>
            <ToggleGroupItem value="created_by" variant="outline">
              Créés par moi
              <Badge variant="outline">{f_creator.length || "0"}</Badge>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="inline-flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/plugins/sub-object/create" className="inline-flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Créer un nouveau sous-objet
            </Link>
          </Button>
          <Button onClick={revalidate} disabled={loading}>
            <ReloadIcon className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Rafraîchir
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
        {!loading ? (
          <>
            {filtered.map((o) => (
              <SubObjectCard {...o} key={o._id} isLink />
            ))}
          </>
        ) : null}
        <Link
          href="/admin/plugins/sub-object/create"
          className="flex flex-col items-center justify-center h-32 gap-2 duration-150 border border-dashed rounded-xl group hover:border-opengeo"
        >
          <PlusIcon className="w-8 h-8 text-gray-400 duration-150 group-hover:text-opengeo" />
          <span className="text-gray-400 duration-150 group-hover:text-opengeo">Ajouter un sous-objet</span>
        </Link>
      </div>
    </div>
  );
};
