import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { search as _search, filterByCreator, sortByName } from "@/lib/models/generic-object";
import { getEntityFromContact } from "@/lib/user";
import { cn } from "@/lib/utils";
import { APIResult } from "@/types/api";
import { GenericObject } from "@/types/generic-object";
import { GenericObjectCard } from "@components/generic-object/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Input,
  ToggleGroup,
  ToggleGroupItem,
} from "@components/ui";
import { RefreshCwIcon, SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const GenericObjectIndexPage = () => {
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
    <div className="container flex flex-col w-full h-full gap-4 p-6 mx-auto overflow-x-hidden overflow-y-auto ">
      <h1 className="inline-flex items-center text-3xl font-bold font-title text-opengeo ">Objets</h1>
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
          <Button onClick={revalidate} disabled={loading}>
            <RefreshCwIcon className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Rafraîchir
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {!loading ? (
          <>
            {filtered.length > 0 ? (
              <Accordion type="multiple" defaultValue={Array.from(new Set(filtered.map((o) => o.metadata.label)))}>
                {Object.entries(
                  filtered.reduce(
                    (acc, cur) => {
                      // group by metadata.label
                      const group = acc[cur.metadata.label] || [];
                      group.push(cur);
                      acc[cur.metadata.label] = group;
                      return acc;
                    },
                    {} as Record<string, GenericObject[]>,
                  ),
                ).map(([reference, objects]) => (
                  <AccordionItem value={reference} key={reference}>
                    <AccordionTrigger className="inline-flex items-center w-full gap-2 ">
                      <span className="inline-flex items-center gap-2">
                        <strong className="first-letter:uppercase font-title">{reference}</strong>
                        <Badge>{objects.length}</Badge>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                      {objects.map((object) => (
                        <GenericObjectCard {...object} key={object._id} isLink />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="p-12 mx-auto text-center">Aucune fiche de synthèse trouvée.</p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default GenericObjectIndexPage;
