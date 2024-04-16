import { useAuth } from "@/hooks/useAuth";
import { getAllObjectsWithEntity } from "@/lib/fetchers/generic-object";
import { quickEdit } from "@/lib/fetchers/quick-edit";
import { log } from "@/lib/log";
import { getEntityFromContact } from "@/lib/user";
import { GenericFieldValue, GenericObject } from "@/types/generic-object";
import { AdminLayout } from "@components/layouts/admin";
import { Disclosure } from "@headlessui/react";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/hooks/useHabilitation";
import { SEP } from "@/pages/api/quick-edit/download";
import { HeadTitle } from "@components/helpers/head/title";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import { ChevronUpIcon, DownloadIcon, QuestionMarkCircledIcon, UploadIcon } from "@radix-ui/react-icons";
import { Router } from "next/router";

/**
 * A dynamic import statement that loads the `Handsontable` component.
 *
 * @remarks The `dynamic` function from `next/dynamic` is used to load the `Handsontable` component dynamically to improve performance. The `import` statement is used to import the `Handsontable` component from the `@components/helpers/handsontable` module. The `ssr` option is set to `false` to prevent server-side rendering of the component.
 * @remarks It is already SSR-disabled in the `@components/helpers/handsontable` module, but it is set here as well to prevent any potential issues.
 *
 * @returns A Promise that resolves to the `Handsontable` component.
 */
const Handsontable = dynamic(() => import("@components/helpers/handsontable").then((mod) => mod.Handsontable), {
  ssr: false,
});

const QuickEdit: NextPage = () => {
  const { user } = useAuth();
  const [objects, setObjects] = useState<GenericObject[]>([]);

  /**
   * A React hook that fetches all objects with the specified entity and sets the state of the `objects` variable.
   *
   * @remarks The `getAllObjectsWithEntity` function is used to fetch all objects with the specified entity. The `setObjects` function is used to set the state of the `objects` variable to the fetched objects. The `user.entity` variable is used to specify the entity to fetch objects for. The hook is triggered whenever the `user.entity` variable changes.
   */
  useEffect(() => {
    getAllObjectsWithEntity(getEntityFromContact(user)).then(setObjects);
  }, [user]);

  /**
   * React hooks that memoize the results of expensive computations.
   *
   * @remarks - objects_data - Each object is a GenericField with a key to refer to its base object
   *    ([site_id]/[subobject]/[number]/[field position] => site_id/irve/0/1)
   * @remarks - rowHeaders   - Each string is GenericObject's value of GenericField where label == "Nom"
   *    ([site.values.find((field) => field.label === "Nom")?.value] => ALENCON)
   * @remarks - colHeaders   -  Each string is objects_data object.label
   *    ([objects_data[0].label] => Nom)
   * @remarks - hot_data     -  Each string[] is a GenericObject's values
   *    ([hot_data[0]] => ["7 RUE ROBERT SCHUMAN 61000 Alençon","48.429471,0.066452","DR NORMANDIE","ALE","ALENCON"])
   *
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { objects: objects_data, escaped: escaped_data } = useMemo(() => parseObjects(objects), [objects]);
  const rowHeaders = useMemo(() => getRowHeaders(objects_data, objects), [objects_data, objects]);
  const colHeaders = useMemo(() => getColHeaders(objects_data), [objects_data]);
  const hot_data = useMemo(
    () => buildHandsontableData(objects_data, objects, colHeaders, rowHeaders),
    [objects_data, objects, colHeaders, rowHeaders],
  );

  /**
   * A React hook that creates a state variable for the `data` variable and a function to update it.
   *
   * @remarks The purpose is to allow the `Handsontable` component to update the `data` variable, instead of using hot_data memoized variable directly.
   */
  const [data, setData] = useState<string[][]>([]);
  useEffect(() => {
    setData(hot_data);
  }, [hot_data]);

  const [hasChanged, setHasChanged] = useState<number[]>([]);

  /**
   * A function that sends a POST request to update the objects in the database with the changes made in the Handsontable table.
   *
   * @remarks The function filters the `data` variable to only include the rows that have been changed. The `parseHandsontableData` (see JSDOC comment) function is used to parse the filtered data and create new objects to update in the database. The `quickEdit` function is used to send a POST request to update the objects in the database. The function displays a loading toast while the request is being sent. If the request is successful, the function displays a success toast. If the request fails, the function displays an error toast.
   */
  const post = async () => {
    const filtered = data.filter((_, i) => hasChanged.includes(i));
    const new_objects = parseHandsontableData(filtered, objects, objects_data, colHeaders, escaped_data);
    let toastId = toast.loading("Enregistrement des données...");
    try {
      const result = await quickEdit(new_objects);
      if (result) {
        result.matchedCount === filtered.length
          ? toast.success("Données enregistrées avec succès", { id: toastId, icon: "✅" })
          : toast.error("Une erreur est survenue lors de l'enregistrement des données", { id: toastId, icon: "🚨" });
        setHasChanged([]);
      }
    } catch (e) {
      log.error(e);
      toast.error("Une erreur est survenue lors de l'enregistrement des données", {
        id: toastId,
        icon: "🚨",
        description: (e as Error)?.message,
      });
    }
  };

  // Prevent user from changing the page if hasChanged is not empty
  useEffect(() => {
    const nativeBrowserHandler = (event: BeforeUnloadEvent) => {
      if (hasChanged.length > 0) {
        Router.events.emit("routeChangeComplete");
        event.preventDefault();
        event.returnValue = "";
      }
    };

    const nextNavigationHandler = () => {
      if (hasChanged.length > 0) {
        if (!window.confirm("Vous n'avez pas sauvegardé les changements, voulez-vous quand même quitter la page ?")) {
          Router.events.emit("routeChangeError");
          // eslint-disable-next-line no-throw-literal
          throw "Abort route change by user's confirmation.";
        }
      }
    };

    window.addEventListener("beforeunload", nativeBrowserHandler);
    Router.events.on("beforeHistoryChange", nextNavigationHandler);

    // On component unmount, remove the event listener
    return () => {
      window.removeEventListener("beforeunload", nativeBrowserHandler);
      Router.events.off("beforeHistoryChange", nextNavigationHandler);
    };
  }, [hasChanged]);

  return (
    <RoleGuard level={100}>
      <HeadTitle title="Quick-edit" />
      <AdminLayout>
        <div className="flex flex-col w-full h-full gap-2 p-4 overflow-hidden">
          <div className="inline-flex items-center justify-between w-full mb-4">
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-x-4">
                <h1 className="inline-flex items-center text-3xl font-bold font-title text-opengeo ">
                  Modification rapide des objets
                </h1>
                <span className="px-3 py-1 mt-1 text-xs font-bold text-white flex-nowrap w-fit rounded-2xl bg-opengeo font-title">
                  {objects.length}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {`Cette page permet de modifier rapidement les objets de l'entité ${
                  getEntityFromContact(user) || "Inconnue"
                }.`}
              </p>
              <p className="inline-flex items-center gap-2 -mt-1 text-xs text-gray-500">
                {`La structure de données n'est pas modifiable sur cette page. Seules les valeurs peuvent être modifiées.`}
                <span>&bull;</span>
                <Link
                  className="font-bold hover:underline text-opengeo font-title"
                  href="/admin/plugins/generic-object"
                >
                  Gérer les objets
                </Link>
                &bull;
                <Link className="font-bold hover:underline text-opengeo font-title" href="/admin/plugins/sub-object">
                  Gérer les sous-objets
                </Link>
              </p>
            </div>
            <div className="inline-flex items-center gap-2">
              {/* <Button
                variant="destructive"
                disabled={hasChanged.length === 0}
                onClick={() => {
                  setData(hot_data);
                  setHasChanged([]);
                }}
              >
                <TrashIcon className="w-4 h-4" />
                Réinitialiser les changements
              </Button> */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      onClick={() => {
                        fetch("/api/quick-edit/download", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ rows: rowHeaders, cols: colHeaders, data }),
                        }).then((res) => {
                          res.blob().then((blob) => {
                            const url = window.URL.createObjectURL(new Blob([blob]));
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute("download", `opengeo-${getEntityFromContact(user)}.csv`);
                            document.body.appendChild(link);
                            link.click();
                          });
                        });
                      }}
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Télécharger
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="mr-4 text-right">
                    <p className="text-xs ">{`Le séparateur du fichier CSV est le ( ${SEP} ), merci de bien vérifier que Excel est bien configuré.`}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <section>
            <Handsontable
              dropdownMenu
              persistentState
              rowHeaderWidth={200}
              height={900}
              {...{ rowHeaders, colHeaders }}
              columns={colHeaders.map((col) => ({ readOnly: col === "Nom" }))}
              data={data}
              afterChange={(changes, action) => {
                if (!(action === "edit" || action === "CopyPaste.paste" || action === "Autofill.fill")) return;
                let tmp = [...data];
                let tmp_hasChanged: number[] = [...hasChanged];
                changes?.forEach(([row, col, , newValue]) => {
                  if (newValue === undefined || row === undefined || col === undefined) return;
                  tmp[row][col as number] = newValue;
                  if (!tmp_hasChanged.includes(row)) tmp_hasChanged.push(row);
                });
                setData(tmp);
                setHasChanged(tmp_hasChanged);
              }}
            />
          </section>
          <div className="inline-flex justify-end w-full">
            <Button disabled={hasChanged.length === 0} onClick={post}>
              <UploadIcon className="w-4 h-4" />
              Enregistrer
            </Button>
          </div>
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button
                  className={`flex justify-between w-full p-4 text-sm font-semibold text-left transition-colors duration-300 rounded-lg font-title text-opengeo-900 bg-opengeo-100 hover:bg-opengeo-200 focus:outline-none ${
                    open ? "ring" : "focus-visible:ring"
                  } ring-opengeo ring-opacity-75`}
                >
                  <span className="inline-flex items-center gap-x-2">
                    <QuestionMarkCircledIcon className="w-4 h-4" />
                    Aide
                  </span>
                  <div className="inline-flex items-center space-x-3">
                    <ChevronUpIcon
                      className={`${open ? "transform rotate-180" : ""} w-5 h-5 text-opengeo duration-300 transform`}
                    />
                  </div>
                </Disclosure.Button>
                <Disclosure.Panel className="p-4 text-sm bg-gray-50 rounded-xl">
                  <p className="mb-4 text-xs text-gray-500">
                    {`Il n'y a pas encore de validation des données sur cette page. Il est donc possible d'envoyer des données
            incorrectes. Il est donc recommandé de vérifier les données avant de les envoyer.`}
                  </p>
                  <ul className="grid grid-cols-4 gap-2">
                    <li>
                      <p className="text-sm font-bold text-gray-700">Valeurs textuelles</p>
                      <p className="text-xs text-gray-500">
                        Les valeurs textuelles sont représentées par des chaînes de caractères.
                      </p>
                    </li>
                    <li>
                      <p className="text-sm font-bold text-gray-700">Valeurs numériques</p>
                      <p className="text-xs text-gray-500">
                        Les valeurs numériques sont représentées par des nombres entiers ou décimaux.
                        <br /> Les virgules sont remplacées par des points (.) dans les nombres décimaux.
                      </p>
                    </li>
                    <li>
                      <p className="text-sm font-bold text-gray-700">Valeurs Oui/Non</p>
                      <p className="text-xs text-gray-500">
                        Les valeurs <span className="font-bold">Oui</span> et <span className="font-bold">Non</span>{" "}
                        sont représentées par <span className="font-bold">true</span> et{" "}
                        <span className="font-bold">false</span>.
                      </p>
                    </li>
                    <li>
                      <p className="text-sm font-bold text-gray-700">Valeurs de coordonnées</p>
                      <p className="text-xs text-gray-500">
                        Les valeurs de coordonnées sont représentées par deux nombres décimaux séparés par une
                        esperluette (&).
                        <br /> Les virgules sont remplacées par des points (.) dans les nombres décimaux.
                      </p>
                    </li>
                    <li>
                      <p className="text-sm font-bold text-gray-700">Valeurs fichiers</p>
                      <p className="text-xs text-red-500">
                        Merci de ne pas modifier les valeurs de fichiers via QuickEdit
                      </p>
                    </li>
                  </ul>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default QuickEdit;

type ObjectData = {
  label: GenericObject["values"][number]["label"];
  type: GenericObject["values"][number]["type"];
  value: GenericObject["values"][number]["value"];
  key: string;
};

/**
 * A function that parses an array of GenericObject and returns an array of ObjectData.
 *
 * @remarks The function maps over the `objects` array and extracts the values of each object. It then maps over the values and creates an array of object data with a `label`, `type`, `value`, and `key` property for each value. The `key` property is a unique identifier for each value that is used to identify the value in the Handsontable table. The function also maps over the children of each object and extracts their values in the same way. The resulting arrays of object data are concatenated and sorted by their `key` property. The function returns the concatenated and sorted array of object data.
 * @remarks key - ([site_id]/[subobject]/[number]/[field position] => site_id/irve/0/1)
 *
 * @param objects An array of objects to parse.
 *
 * @returns An array of object data with a `label`, `type`, `value`, and `key` property for each value of each object.
 */
const parseObjects = (objects: GenericObject[]): { objects: ObjectData[]; escaped: ObjectData[] } => {
  const escaped_objects = [] as ObjectData[];
  const object_values = objects
    .map(
      (object) =>
        object.values
          .map((v, i) => {
            if (v.type !== "file") return { label: v.label, type: v.type, value: v.value, key: `${object._id}/${i}` };
            escaped_objects.push({
              label: v.label,
              type: v.type,
              value: v.value,
              key: `${object._id}/${i}`,
            });
            return undefined;
          })
          .filter(Boolean) as ObjectData[],
    )
    .flat();

  const object_children = objects
    .map((object) =>
      Object.entries(object.children).map(([key, children]) =>
        children.map(
          (child, i) =>
            child.values
              .map((v, j) => {
                if (v.type !== "file")
                  return {
                    label: v.label,
                    type: v.type,
                    value: v.value,
                    key: `${object._id}/${key}/${i}/${j}`,
                  };
                escaped_objects.push({
                  label: v.label,
                  type: v.type,
                  value: v.value,
                  key: `${object._id}/${key}/${i}/${j}`,
                });
                return undefined;
              })
              .filter(Boolean) as ObjectData[],
        ),
      ),
    )
    .flat();

  return {
    objects: [...object_values, ...object_children].flat(2).sort((a, b) => a.key.localeCompare(b.key)) as ObjectData[],
    escaped: escaped_objects.sort((a, b) => a.key.localeCompare(b.key)) as ObjectData[],
  };
};

/**
 * A function that creates an array of row headers for the Handsontable table.
 *
 * @remarks The function maps over the `objects_data` array and extracts the `Nom` value of each object. It then removes duplicates from the resulting array and returns it as the array of row headers for the Handsontable table. The `objects` variable is used to find the object that corresponds to each row header. The `key` property of each object data is used to identify the object that corresponds to each row header.
 * @remarks new Set is used to remove duplicates from the array. Array.from is used to convert the Set to an array because Set does not have a map method (not iterable).
 *
 * @param objects_data An array of object data to create row headers from.
 * @param objects An array of objects to find the object that corresponds to each row header.
 *
 * @returns An array of row headers for the Handsontable table.
 */
const getRowHeaders = (objects_data: ObjectData[], objects: GenericObject[]) => {
  return Array.from(
    new Set(
      objects_data.map(
        (c) =>
          objects
            .find((o) => o._id === c.key.split("/")[0])
            ?.values.find((v) => v.label === "Nom")
            ?.value.toString() ?? "",
      ),
    ),
  );
};

/**
 * A function that creates an array of column headers for the Handsontable table.
 *
 * @remarks The function maps over the `objects_data` array and extracts the `label` and `key` properties of each object data. It then creates a column header for each object data with the format `child key - label` if the `key` property contains a child index, or with the format `label` otherwise. The resulting array of column headers is sorted alphabetically and returned as the array of column headers for the Handsontable table.
 * @remarks ([key = site_id/irve/0/1] => irve 0 - 22kva)
 *
 * @param objects_data An array of object data to create column headers from.
 *
 * @returns An array of column headers for the Handsontable table.
 */
const getColHeaders = (objects_data: ObjectData[]) => {
  return Array.from(
    new Set(
      objects_data.map((c) => {
        const [, child, key] = c.key.split("/");
        if (!Number.isNaN(Number(child))) return c.label;
        return `${child} ${key} - ${c.label}`;
      }),
    ),
  ).sort();
};

/**
 * A function that builds the data for the Handsontable table based on the parsed objects, row headers, and column headers.
 *
 * @remarks The function maps over the `rowHeaders` array and finds the object that corresponds to each row header in the `objects` array. It then filters the `objects_data` array to find the object data that corresponds to the object and creates an array of site values and sub-objects for the object. The function maps over the `colHeaders` array and finds the value that corresponds to each column header in the site values and sub-objects arrays. If a value is found, it is added to the resulting row data array. If a value is not found, an empty string is added to the resulting row data array. The resulting row data arrays are concatenated and returned as the data for the Handsontable table.
 *
 * @param objects_data An array of object data to build the Handsontable table data from.
 * @param objects An array of objects to find the object that corresponds to each row header.
 * @param colHeaders An array of column headers for the Handsontable table.
 * @param rowHeaders An array of row headers for the Handsontable table.
 *
 * @returns An array of row data arrays for the Handsontable table.
 */
const buildHandsontableData = (
  objects_data: ObjectData[],
  objects: GenericObject[],
  colHeaders: string[],
  rowHeaders: string[],
) => {
  return rowHeaders.reduce((acc, cur) => {
    const site = objects.find(
      (o) => o.values.find((v) => v.label === "Nom")?.value.toString() === cur,
    ) as GenericObject;
    const site_values = objects_data.filter((d) => d.key.startsWith(site._id)); // .filter((d) => d.label !== "Nom");
    const site_sub_objects = objects_data.filter(
      (d) => d.key.startsWith(site._id) && Number.isNaN(Number(d.key.split("/")[1])),
    );

    return [
      ...acc,
      // link site values to colHeaders positions
      colHeaders.map((col) => {
        // const [, child] = col.split(" ");
        const value =
          site_values.find((v) => v.label === col)?.value ||
          site_sub_objects.find((v) => {
            const [, child, key] = v.key.split("/");
            return `${child} ${key} - ${v.label}` === col;
          })?.value;
        if (!value) return "";

        // If value is coordinates, replace the comma with a "&"
        if (Array.isArray(value)) return value.join("&");
        if (typeof value === "object") return JSON.stringify(value);
        return value.toString();
      }),
    ];
  }, [] as any[]) as any;
};

/**
 * A function that parses the data from the Handsontable table and creates an array of objects with the updated values.
 *
 * @remarks The function maps over the `data` array and finds the object that corresponds to each row in the `objects` array. It then filters the `objects_data` array to find the object data that corresponds to the object and creates a new object with the updated values. The function maps over the `colHeaders` array and finds the value that corresponds to each column header in the object data. If a value is found, it is added to the resulting object's `values` array. If a value is not found, the existing value is used instead. The resulting objects are concatenated and returned as the updated objects with the new values.
 * @remarks parseHandsontableData is used to reverse buildHandsontableData to match database data structure.
 *
 * @param data An array of row data arrays from the Handsontable table.
 * @param objects An array of objects to find the object that corresponds to each row.
 * @param objects_data An array of object data to update with the new values.
 * @param colHeaders An array of column headers for the Handsontable table.
 *
 * @returns An array of objects with the updated values.
 */
const parseHandsontableData = (
  data: string[][],
  objects: GenericObject[],
  objects_data: ObjectData[],
  colHeaders: string[],
  escaped_objects: ObjectData[],
): GenericObject[] => {
  const new_objects: GenericObject[] = data.reduce((acc, cur) => {
    const site = objects.find((o) =>
      cur.some((value) => value === o.values.find((v) => v.label === "Nom")?.value.toString()),
    ) as GenericObject;

    if (!site) {
      log.debug("DEBUG: No site found", cur);
      return acc;
    }

    const site_values = [...objects_data, ...escaped_objects].filter((d) => d.key.startsWith(site?._id));
    let base: GenericObject = site_values
      .filter((s) => {
        const [, child] = s.key.split("/");
        return !Number.isNaN(Number(child));
      })
      .reduce(
        (acc, cur) => {
          const row = data.find((r) =>
            r.some((v) => v === site.values.find((v) => v.label === "Nom")?.value.toString()),
          );

          return {
            ...acc,
            _id: site._id,
            metadata: site.metadata,
            values: [
              ...(acc.values ?? []),
              {
                label: cur.label,
                type: cur.type,
                value: getValue(row?.[colHeaders.indexOf(cur.label)], cur.type),
              },
            ],
          } as GenericObject;
        },
        { metadata: site.metadata } as GenericObject,
      );

    base = site_values
      .filter((s) => {
        const [, child] = s.key.split("/");
        return Number.isNaN(Number(child));
      })
      .reduce((acc, cur) => {
        const row = data.find((r) => r.some((v) => v === site.values.find((v) => v.label === "Nom")?.value.toString()));
        const [, child, key] = cur.key.split("/");
        const key_number = Number(key);

        return {
          ...acc,
          children: {
            ...acc.children,
            [child]: Object.values({
              ...acc.children?.[child],
              [key]: {
                _id: site.children?.[child]?.[key_number]?._id,
                metadata: site.children?.[child]?.[key_number]?.metadata,
                values: [
                  ...(acc.children?.[child]?.[key_number]?.values ?? []),
                  {
                    label: cur.label,
                    type: cur.type,
                    // todo: fixme get escaped objects cant be based on colheaders
                    value:
                      colHeaders.indexOf(`${child} ${key} - ${cur.label}`) !== -1
                        ? getValue(row?.[colHeaders.indexOf(`${child} ${key} - ${cur.label}`)], cur.type)
                        : // object is escaped
                          escaped_objects.find((o) => o.key === cur.key)?.value,
                  },
                ],
              },
            }),
          },
        } as GenericObject;
      }, base);

    return [...acc, base];
  }, [] as GenericObject[]);
  return new_objects;
};

/**
 * A function that converts a string value to the appropriate type based on the field type.
 *
 * @remarks The function takes a string value and a field type as input and returns the value converted to the appropriate type. If the field type is "number", the function returns the value as a number. If the field type is "boolean", the function returns the value as a boolean. If the field type is "coordinates", the function returns the value as an array of two strings. Otherwise, the function returns the value as a string.
 * @remarks getValue is used to parse the string values from the Handsontable table to the appropriate type.
 *
 * @param value A string value to convert to the appropriate type.
 * @param type A string representing the field type.
 *
 * @returns The value converted to the appropriate type.
 */
const getValue = (value: string | undefined, type: string): GenericFieldValue => {
  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      return value === "true";
    case "coordinates":
      return (value?.split("&") as [string, string]) || "";
    case "file":
      return value ? JSON.parse(value) : "";
    default:
      return value || "";
  }
};
