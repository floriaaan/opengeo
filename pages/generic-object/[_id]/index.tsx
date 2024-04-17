import { useFetch } from "@/hooks/useFetch";
import { usePreferences } from "@/hooks/usePreferences";
import { cn } from "@/lib/utils";
import { FileDocument } from "@/models/File";
import { APIResult } from "@/types/api";
import { GenericObject } from "@/types/generic-object";
import { PinnedSubObject } from "@components/generic-object/pinned";
import { SubObject } from "@components/generic-object/sub-object";
import { ErrorPage } from "@components/helpers/error/page";
import { HeadTitle } from "@components/helpers/head/title";
import { MapObject } from "@components/map";
import { Badge } from "@components/ui/badge";
import { Breadcrumb } from "@components/ui/breadcrumb";
import { LargeLoader } from "@components/ui/loader/large";
import { ScrollArea } from "@components/ui/scroll-area";
import { regions } from "@resources/regions";
import {
  BackpackIcon,
  ChevronDownIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  MapPinIcon,
  MousePointerClickIcon,
  PencilIcon,
} from "lucide-react";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { canHaveAccess } from "@/hooks/useHabilitation";
import { convertCoordinates, sortByName } from "@/lib/models/generic-object";
import { SyntheseType } from "@/types/synthese";
import { Suggestion } from "@components/suggestion/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui";
import { Accordion } from "@components/ui/accordion";
import { Button } from "@components/ui/button";
import Link from "next/link";

const MapDetails = dynamic(() => import("@components/generic-object/map").then((mod) => mod.MapDetails), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <LargeLoader />
    </div>
  ),
});

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return { props: { _id: ctx.query._id } };
};

/**
 * A React component that renders a page for displaying the details of a single site.
 *
 * @remarks The component takes two props: `genericObject`, which is an object containing the details of the site to display, and `genericObjects`, which is an array of all `GenericObject`s. The component renders the site's name, description, and a list of its pages. The component also renders a map showing the site's location.
 *
 * @param genericObject - An object containing the details of the site to display.
 * @param genericObjects - An array of all `GenericObject`s.
 *
 * @returns A React component that renders a page for displaying the details of a single site.
 */
const GenericObjectDetailPage = ({ _id }: { _id: string }) => {
  const { push, asPath } = useRouter();

  const { data: api_all, loading: all_loading } = useFetch<APIResult<GenericObject[]>>(
    "/api/generic-object/get?select=metadata.entity%20values",
  );
  const objects = useMemo(() => (api_all?.data || []).sort(sortByName) || [], [api_all]);

  const [id, setId] = useState(_id);
  const { data: api, loading } = useFetch<APIResult<GenericObject>>(`/api/generic-object/get?id=${id}`);
  const object = useMemo(() => api?.data, [api]);

  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const filtered = !all_loading
    ? selectedRegion
      ? objects.filter((data) => data.metadata.entity === selectedRegion)
      : objects
    : [];

  useEffect(() => {
    if (asPath !== `/generic-object/${id}`) push(`/generic-object/${id}`);
  }, [id, push, asPath]);

  useEffect(() => {
    if (!object) return;
    if (selectedRegion && object.metadata.entity !== selectedRegion) {
      toast.info(
        `L'objet ${object.values.find((data) => data.label == "Nom")?.value} n'est pas dans la région sélectionnée`,
      );
      return;
    }
    if (selectedRegion) setSelectedRegion(object.metadata.entity);
  }, [object, selectedRegion]);

  const mapRef = useRef();

  const { preferences } = usePreferences();
  const pinnedSubObjects = useMemo(
    () =>
      object
        ? Object.entries(object.children).filter(([, sub]) => {
            // if no preferences, show none
            if (!preferences?.pinnedSubObjects) return false;
            // if preferences, show only if not pinned because pinned are already shown upper
            return preferences.pinnedSubObjects.includes(sub[0]?._id);
          })
        : [],
    [object, preferences],
  );
  const subObjects = useMemo(
    () =>
      object
        ? Object.entries(object.children).filter(([, sub]) => {
            // if no preferences, show all
            if (!preferences?.pinnedSubObjects) return true;
            // if preferences, show only if not pinned because pinned are already shown upper
            return !preferences.pinnedSubObjects.includes(sub[0]?._id);
          })
        : [],
    [object, preferences],
  );

  if (!object) return <LargeLoader />;

  if (filtered.length === 0 || (!object && !loading))
    return (
      <div className="max-h-[90vh] h-full">
        <GenericObjectBreadcrumb {...{ selectedRegion, setSelectedRegion, filtered, setId, mapRef, regions, object }} />
        <ErrorPage http={404} message="L'objet que vous recherchez n'existe pas." />
      </div>
    );

  return (
    <>
      <HeadTitle title={(object.values.find((data) => data.label == "Nom")?.value as string) || `Objet ${id}`} />
      <GenericObjectBreadcrumb {...{ selectedRegion, setSelectedRegion, filtered, setId, mapRef, regions, object }} />

      <div className="px-4 mx-auto 2xl:max-w-[85vw] xl:max-w-[85rem] my-6">
        <div className="relative flex flex-col-reverse grid-cols-1 gap-4 lg:grid lg:grid-cols-2">
          {/* INFORMATIONS GENERALES */}
          <div className="flex flex-col relative gap-y-2 lg:max-h-[calc(100vh-64px-47px-44px-4rem)]">
            <div className="sticky flex flex-col gap-y-2">
              <div className="inline-flex justify-between w-full gap-x-2">
                <h1 className="mb-2 text-3xl font-bold font-title text-opengeo">
                  {object.values.find((data) => data.label == "Nom")?.value.toString()}
                </h1>
                {canHaveAccess(object.metadata.entity, 100) && (
                  <Button variant="outline" asChild>
                    <Link href={`/admin/plugins/generic-object/${id}`}>
                      <PencilIcon className="w-4 h-4" />
                      <span>Modifier</span>
                    </Link>
                  </Button>
                )}
              </div>
              {object.metadata.description && (
                <p className="text-sm font-light text-gray-500">{object.metadata.description}</p>
              )}
              <h2 className="mb-2 text-xl font-bold font-title text-opengeo">Informations générales</h2>
              <div className="flex flex-col gap-1.5">
                {(object.values || []).map((data, i) => (
                  <div key={data.label} className="flex items-start gap-2 md:text-sm">
                    <p className="text-sm font-light min-w-[64px] md:min-w-[128px] text-black shrink-0">{data.label}</p>
                    <div
                      className={cn(
                        "flex justify-end gap-x-1",
                        data.type === "file" ? "flex-col items-start" : "flex-row items-center",
                      )}
                    >
                      <div className="flex flex-col gap-1 shrink md:items-center md:flex-row">
                        <p className="font-bold text-black md:truncate">
                          {data.type === "coordinates" ? (
                            <>
                              {(data.value as [string, string])?.[0]} / {(data.value as [string, string])?.[1]}
                            </>
                          ) : data.type === "file" ? (
                            <a
                              href={(data.value as FileDocument).path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-opengeo hover:underline"
                            >
                              {(data.value as FileDocument).name}
                            </a>
                          ) : data.type === "url" ? (
                            <a
                              href={data.value as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center font-bold hover:underline text-opengeo gap-x-1"
                            >
                              <ExternalLinkIcon className="w-3 h-3" />
                              {data.value as string}
                            </a>
                          ) : (
                            data.value?.toString()
                          )}
                        </p>
                        {data?.label === "Adresse" && (
                          <Badge variant="outline" className="py-0.5 w-fit">
                            <a
                              className="inline-flex items-center gap-1"
                              href={"https://www.google.com/maps?hl=fr&q=" + data.value}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                className="w-4 h-4"
                                // gmaps logo
                                src="/img/maps_logo.png"
                                alt="Google Maps"
                              />
                              Ouvrir <span className="md:hidden">dans Google Maps</span>
                            </a>
                          </Badge>
                        )}
                      </div>
                      <Suggestion data={data} object={object} path={`${object._id}.values[${i}].value`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ScrollArea className="mt-6 overflow-x-visible overflow-y-auto lg:pr-3">
              {/* PINNED SUBOBJECTS */}
              {pinnedSubObjects.length > 0 && (
                <div className="">
                  <h1 className="mb-5 text-xl font-bold capitalize font-title text-opengeo">épinglés</h1>
                  {object?.children && (
                    <div className="grid gap-2 md:grid-cols-2 ">
                      {pinnedSubObjects.map(([, sub], i) => (
                        <PinnedSubObject key={`subobject-pinned-list-${i}`} data={sub} object={object} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/** DOMAINES */}
              <div className="mt-6 mb-6">
                <h1 className="mb-5 text-xl font-bold font-title text-opengeo">Sous-objets</h1>
                {object?.children && (
                  <Accordion type="multiple">
                    {subObjects.map(([, sub], i) => (
                      <SubObject key={`subobject-list-${i}`} data={sub} object={object} />
                    ))}
                  </Accordion>
                )}
                {!object?.children && <h1>Pas de sous-objets pour ce site</h1>}
              </div>
            </ScrollArea>
          </div>
          <div className="z-50 w-full h-64 overflow-hidden rounded-md lg:h-[calc(100vh-64px-47px-44px-4rem)] sticky">
            <MapDetails {...object} mapRef={mapRef} />
          </div>
        </div>
      </div>
    </>
  );
};

export default GenericObjectDetailPage;

const GenericObjectBreadcrumb = ({
  selectedRegion,
  setSelectedRegion,
  filtered,
  setId,
  mapRef,
  regions,
  object,
}: {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  filtered: GenericObject[];
  setId: (id: string) => void;
  mapRef: any;
  regions: string[];
  object: GenericObject;
}) => {
  const { data: api_synthese, loading: loading_synthese } = useFetch<APIResult<SyntheseType[]>>(
    `/api/synthese/get?reference=${object.metadata.label}`,
  );
  const syntheses = useMemo(() => api_synthese?.data || [], [api_synthese]);

  return (
    <Breadcrumb
      pages={[
        {
          name: selectedRegion || "Toutes les régions",
          icon: <MapPinIcon className="hidden w-4 h-4 mr-2 shrink-0 lg:block" />,
          children: regions.map((e) => ({
            name: e || "Toutes les régions",
            onClick: () => {
              setSelectedRegion(e);
            },
            selected: selectedRegion === e,
          })),
          className: "whitespace-nowrap",
        },
        ...(filtered.length > 0
          ? [
              {
                name: (object.values.find((data) => data.label == "Nom")?.value as string) || "Non renseigné",
                icon: <BackpackIcon className="hidden w-4 h-4 mr-2 shrink-0 lg:block" />,
                className: "whitespace-nowrap",
                children: filtered.map((e) => ({
                  name: e.values.find((field) => field.label == "Nom")?.value.toString() || "Non renseigné",
                  onClick: () => {
                    setId(e._id);
                    if (mapRef?.current)
                      (mapRef.current as MapObject).flyTo(convertCoordinates(e), 16, { animate: true, duration: 1.5 });
                  },
                })),
              },
            ]
          : []),
      ]}
      actions={
        <div className="group">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-gray-500">
                <MousePointerClickIcon className="w-4 h-4" />
                Voir plus{" "}
                <ChevronDownIcon className="w-4 h-4 group-data-[state=open]:rotate-180 transition duration-100" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mx-6 mt-2">
              <DropdownMenuLabel className="inline-flex items-center gap-1">
                <ClipboardIcon className="w-4 h-4" />
                Fiches synthèse
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {loading_synthese ? (
                <p>Chargement...</p>
              ) : syntheses?.length > 0 ? (
                syntheses.map((synthese) => (
                  <DropdownMenuItem key={synthese._id} asChild className="cursor-pointer">
                    <Link
                      href={`/generic-object/${object._id}/synthese/${synthese._id}?mode=print`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {synthese.metadata.label}
                    </Link>
                  </DropdownMenuItem>
                ))
              ) : (
                <p className="p-2 text-xs italic">Aucune fiche de synthèse trouvée.</p>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    ></Breadcrumb>
  );
};
