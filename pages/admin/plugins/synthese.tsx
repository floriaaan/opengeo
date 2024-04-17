import { AdminLayout } from "@components/layouts/admin";

import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { RoleGuard } from "@/hooks/useHabilitation";
import { search as _search, filterByCreator, sortByName } from "@/lib/models/synthese";
import { getEntityFromContact } from "@/lib/user";
import { cn } from "@/lib/utils";
import { APIResult } from "@/types/api";
import { GenericObject } from "@/types/generic-object";
import { SyntheseType } from "@/types/synthese";
import { SyntheseCreateEditDialogContent } from "@components/admin/synthese/create-edit-dialog";
import { SyntheseDeleteDialog } from "@components/admin/synthese/delete-dialog";
import { HeadTitle } from "@components/helpers/head/title";
import { Synthese } from "@components/synthese";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Input,
  ToggleGroup,
  ToggleGroupItem,
} from "@components/ui";
import { EyeIcon, PencilIcon, PlusIcon, RefreshCwIcon, SearchIcon, TrashIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const SynthesePage = () => {
  const { user } = useAuth();
  const { id: g_id } = user || {};
  const entity = useMemo(() => getEntityFromContact(user), [user]);

  const { data: api, loading, revalidate } = useFetch<APIResult<SyntheseType[]>>(`/api/synthese/get`);
  const objects = useMemo(() => api?.data?.sort(sortByName) || [], [api]);
  const f_entity = useMemo(() => objects.filter((o) => o.metadata.entity === entity), [objects, entity]);
  const f_creator = useMemo(() => objects.filter((o) => filterByCreator(o, g_id)), [objects, g_id]);

  const [selected, setSelected] = useState("entity");
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(objects);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (selected === "entity") setFiltered(f_entity);
    else if (selected === "created_by") setFiltered(f_creator);
    else setFiltered(objects);
  }, [selected, objects, f_entity, f_creator]);

  useEffect(() => {
    if (search.trim() !== "") setFiltered(objects.filter((o) => _search(o, search)));
    else setFiltered(objects);
  }, [search, objects]);

  return (
    <RoleGuard level={100}>
      <HeadTitle title="Fiches synthèse" />
      <AdminLayout>
        <div className="container flex flex-col w-full h-full gap-4 p-6 mx-auto overflow-x-hidden overflow-y-auto ">
          <h1 className="inline-flex items-center text-3xl font-bold font-title text-opengeo ">Fiches synthèse</h1>
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
              </ToggleGroup>
            </div>
            <div className="inline-flex items-center gap-2">
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="inline-flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    Créer une nouvelle fiche
                  </Button>
                </DialogTrigger>
                <SyntheseCreateEditDialogContent
                  onCloseModal={() => {
                    setIsCreateModalOpen(false);
                    revalidate();
                  }}
                />
              </Dialog>
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
                  <Accordion
                    type="multiple"
                    defaultValue={Array.from(new Set(filtered.map((o) => o.metadata.reference)))}
                  >
                    {Object.entries(
                      filtered.reduce(
                        (acc, cur) => {
                          // group by metadata.reference
                          const group = acc[cur.metadata.reference] || [];
                          group.push(cur);
                          acc[cur.metadata.reference] = group;
                          return acc;
                        },
                        {} as Record<string, SyntheseType[]>,
                      ),
                    ).map(([reference, syntheses]) => (
                      <AccordionItem value={reference} key={reference}>
                        <AccordionTrigger className="inline-flex items-center w-full gap-2 ">
                          <span className="inline-flex items-center gap-2">
                            <strong className="first-letter:uppercase font-title">{reference}</strong>
                            <Badge>{syntheses.length}</Badge>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-1">
                          {syntheses.map((synthese) => (
                            <div
                              className="inline-flex items-center justify-between w-full px-2 py-1 border-b last:border-b-0 border-neutral-100 "
                              key={synthese._id}
                            >
                              <div className="flex flex-col">
                                <span className="flex items-center gap-2">
                                  <strong>{synthese.metadata.label}</strong>
                                  <Badge variant="outline">{synthese.metadata.reference}</Badge>
                                </span>
                                <small>
                                  modifié par {synthese.metadata.created_by?.cn} le{" "}
                                  {new Date(synthese.metadata.updated_at).toLocaleDateString("fr-FR", {
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                  })}
                                </small>
                              </div>
                              <span className="flex items-center gap-2">
                                <Badge>{synthese.metadata.entity}</Badge>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="icon">
                                      <EyeIcon className="w-4 h-4" />
                                      <span className="sr-only">Prévisualiser</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="flex flex-col sm:max-w-5xl gap-y-4 max-h-[80vh] overflow-y-auto">
                                    <Synthese synthese={synthese} object={stubObjectFromSynthese(synthese)} />
                                  </DialogContent>
                                </Dialog>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="icon">
                                      <PencilIcon className="w-4 h-4" />
                                      <span className="sr-only">Editer</span>
                                    </Button>
                                  </DialogTrigger>
                                  <SyntheseCreateEditDialogContent onCloseModal={revalidate} initialValues={synthese} />
                                </Dialog>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="destructive" size="icon">
                                      <TrashIcon className="w-4 h-4" />
                                      <span className="sr-only">Supprimer</span>
                                    </Button>
                                  </DialogTrigger>
                                  <SyntheseDeleteDialog synthese={synthese} onCloseModal={revalidate} />
                                </Dialog>
                              </span>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="p-12 mx-auto text-center">
                    Aucune fiche de synthèse trouvée.
                    <small className="block">
                      Cliquez sur le bouton {'"Créer une nouvelle fiche"'} pour en ajouter une.
                    </small>
                  </p>
                )}
              </>
            ) : null}
          </div>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default SynthesePage;

const stubObjectFromSynthese = (synthese: SyntheseType): GenericObject =>
  ({
    _id: "stub",
    metadata: {
      entity: synthese.metadata.entity,
      authorization: "PZW_USER",
      label: synthese.metadata.reference,
      created_at: new Date(),
      updated_at: new Date(),
      description: "",
    },
    values: [{ label: "Nom", type: "string", value: "Example" }] as GenericObject["values"],
    children: synthese.children.reduce(
      (acc, cur) => {
        // group by SyntheseMetadata.reference, in this case it's the same as SubObjectMetadata.label
        const group = acc[cur.metadata.label] || [];

        // populate cur with random values
        const values =
          cur.values?.map((v) => ({
            ...v,
            value: "Example",
          })) || [];

        group.push({ ...cur, values } as GenericObject);
        acc[cur.metadata.label] = group;

        return acc as GenericObject["children"];
      },
      {} as GenericObject["children"],
    ),
  }) as GenericObject;
