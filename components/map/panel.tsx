import { canHaveAccess } from "@/hooks/useHabilitation";
import { usePreferences } from "@/hooks/usePreferences";
import { cn } from "@/lib/utils";
import { FileDocument } from "@/models/File";
import { GenericField, GenericObject } from "@/types/generic-object";
import { PinnedSubObject } from "@components/generic-object/pinned";
import { useCartographie } from "@components/map/context";
import { Suggestion } from "@components/suggestion/dialog";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ExternalLinkIcon, EyeIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

/**
 * A React component that displays detailed information about a selected site.
 *
 * @remarks The component uses the `useCartographie` hook to get the current filters. The component renders the name of the site and its properties in a list. The component also renders the children of the site that match the current filters. The component uses the `Link` component from `next/link` to create a link to the detail page of the site. The `setSelectedSite` function is passed down to the component to allow it to clear the selection when the "Close" button is clicked.
 *
 * @param object - The site object that contains the information to display.
 * @param setSelectedSite - The function to clear the selection when the "Close" button is clicked.
 *
 * @returns A React component that displays detailed information about a selected site.
 */
export const Information = ({ object }: { object: GenericObject; setSelectedSite: any }): JSX.Element => {
  const { filters } = useCartographie();

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

  return (
    <div className="absolute bottom-0 right-0 z-20 flex flex-col w-full p-4 mb-10 bg-white md:max-w-2xl md:max-h-[32rem] h-fit lg:max-w-4xl md:rounded-tl-md drop-shadow-md gap-y-2">
      <div className="flex flex-col justify-between w-full gap-2 md:flex-row md:items-center">
        <div className="flex flex-col">
          {/* <small className="font-bold text-gray-500 uppercase">{object.metadata.label}</small> */}
          <h1 className="w-full mb-2 text-3xl font-extrabold leading-none capitalize text-opengeo font-title">
            {object.values
              .find((e: GenericField) => e.label == "Nom")
              ?.value.toString()
              .toLowerCase()}
          </h1>
        </div>
        <div className="flex flex-row-reverse items-center gap-x-2">
          <Button asChild variant="default">
            <Link href={`/generic-object/${object._id}`} className="">
              <EyeIcon className="w-4 h-4" />
              Voir le détail
            </Link>
          </Button>
          {canHaveAccess(object.metadata.entity, 100) && (
            <Button variant="outline" asChild>
              <Link href={`/admin/plugins/generic-object/${object._id}`}>
                <PencilIcon className="w-4 h-4" />
                <span>Modifier</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      <hr className="w-full mb-0 border-neutral-100" />

      <div className="flex flex-col gap-y-0.5">
        {object.values
          .filter((v) => !["Nom", "Label"].includes(v.label))
          .map((data: GenericField, i: number) => {
            return (
              <div
                key={data.label}
                className="inline-flex items-center justify-between min-h-[1.5rem] gap-2 py-1 whitespace-pre-line border-b border-neutral-100 last:border-b-0 md:text-sm"
              >
                <p className="text-xs min-w-[64px] md:min-w-[128px] text-black shrink-0">{data.label}</p>
                <div
                  className={cn(
                    "flex justify-end text-right gap-x-1",
                    data.type === "file" ? "flex-col items-start" : "flex-row items-center",
                  )}
                >
                  <div className="flex flex-col gap-1 shrink md:items-center md:flex-row">
                    <p className="font-bold text-black md:truncate">
                      {data.type == "coordinates" ? (
                        <>
                          {(data.value as [string, string])[0]} / {(data.value as [string, string])[1]}
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
                    {data.label === "Adresse" && (
                      <Badge variant="outline" className="py-0.5 w-fit ml-auto ">
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
            );
          })}
      </div>

      <ScrollArea className="flex flex-col gap-2 mt-2 overflow-x-visible overflow-y-auto">
        {pinnedSubObjects.length > 0 && object?.children && (
          <>
            <small className="font-bold text-gray-500 uppercase">Epinglés</small>
            <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-3 ">
              {pinnedSubObjects.map(([, sub], i) => (
                <PinnedSubObject key={`subobject-pinned-list-${i}`} data={sub} object={object} />
              ))}
            </div>
            <hr className="w-full border-neutral-100" />
          </>
        )}

        {filters.length > 0 && (
          <>
            <small className="font-bold text-gray-500 uppercase">Filtres</small>
            <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
              {Object.entries(object.children)
                .filter(([_, v]) => {
                  // if filters include v[<index>]._id, return true
                  if (v.length > 0) return v.some((e: GenericObject) => filters.includes(e._id));

                  return false;
                })
                .map(([, value], i) => {
                  return (
                    <PinnedSubObject key={`subobject-list-${i}`} data={value} object={object} />
                    // <div
                    //   className={classNames(
                    //     "flex flex-col shrink-0 gap-y-0.5 w-fit  min-w-[12rem]  items-start",
                    //     key.toLowerCase().includes("contact") && "col-span-2",
                    //   )}
                    //   key={key}
                    // >
                    //   <h3 className="flex justify-between text-sm font-bold capitalize shrink-0 font-title text-gray-950">
                    //     {key}
                    //   </h3>
                    //   <div className="flex flex-col gap-y-0.5 w-full">
                    //     {value.flat().map((v, i) => {
                    //       return (
                    //         <div
                    //           className="flex flex-col gap-y-0.5 w-full items-center justify-between border-b last:border-0"
                    //           key={i}
                    //         >
                    //           {v.values.map((v: GenericField, i: number) => {
                    //             return (
                    //               <div
                    //                 className="inline-flex items-center justify-between w-full border-b gap-x-2 last:border-0"
                    //                 key={i}
                    //               >
                    //                 <p className="flex justify-between text-xs shrink-0">{v.label} : </p>
                    //                 <p className="font-bold text-right text-opengeo">
                    //                   {v.type === "boolean" ? (
                    //                     v.value ? (
                    //                       "Oui"
                    //                     ) : (
                    //                       "Non"
                    //                     )
                    //                   ) : v.type === "file" ? (
                    //                     <a
                    //                       className="inline-flex items-center gap-1 underline text-opengeo-500"
                    //                       href={(v.value as FileDocument).path}
                    //                       target="_blank"
                    //                       rel="noreferrer noopener"
                    //                     >
                    //                       {getIcon((v.value as FileDocument).type, "w-4 h-4")}
                    //                       {(v.value as FileDocument).name}
                    //                     </a>
                    //                   ) : (
                    //                     v.value.toString()
                    //                   )}
                    //                 </p>
                    //               </div>
                    //             );
                    //           })}
                    //         </div>
                    //       );
                    //     })}
                    //   </div>
                    // </div>
                  );
                })}
            </div>
            {/* <hr className="w-full border-neutral-100" /> */}
          </>
        )}
      </ScrollArea>
    </div>
  );
};
