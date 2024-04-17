import { SubObjectDocument } from "@/models";
import { GenericObject } from "@/types/generic-object";
import { useCartographie } from "@components/map/context";
import { Breadcrumb, Page } from "@components/ui/breadcrumb";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import { regions } from "@resources/regions";
import { CircleUserRoundIcon, CircleXIcon, MapPinIcon, PaletteIcon, ShapesIcon } from "lucide-react";
import { Dispatch, SetStateAction, useMemo } from "react";

/**
 * A React component that serves as a filter for the application.
 *
 * @remarks The component uses the `useCartographie` hook to get the current region, filters, and set functions. The component uses the `useState` hook to keep track of the available options for the filter. The component uses the `useEffect` hook to fetch the available options when the component mounts. The component renders a `Breadcrumb` component with three pages: the current region, the number of filters applied, and the available options for the filter. The component renders the available options using the `options` state and the `setFilters` function. The component updates the `filters` state when an option is clicked. The component also updates the `region` and `filters` states when the "Cancel" button is clicked.
 *
 * @returns A React component that serves as a filter for the application.
 */
export const Filters = (): JSX.Element => {
  const {
    region,
    setRegion,
    filters,
    setFilters,
    sites,
    subFilters,
    setSubFilters,
    filters_options: options,
  } = useCartographie();

  const selected_subobject = useMemo(
    () => (filters[0] ? options.find((o) => o._id === filters[0]) : null),
    [filters, options],
  );
  const sub_objects = useMemo(
    () => (selected_subobject ? sites.map((s) => s.children?.[selected_subobject.metadata.label] ?? []).flat() : []),
    [selected_subobject, sites],
  );

  return (
    <div className="absolute left-0 z-10 w-full bg-white lg:bg-transparent lg:w-auto">
      <Breadcrumb
        stopPropagation
        className="lg:rounded-br-md lg:shadow-md"
        pages={[
          {
            name: region || "Toutes les régions",
            icon: <MapPinIcon className="hidden w-4 h-4 shrink-0 lg:block" />,
            children: regions.map((e) => ({
              name: e || "Toutes les régions",
              selected: e === region,
              onClick: () => {
                setRegion(e);
                setFilters([]);
              },
            })),
          },
          {
            name: "Sous-objets",
            icon: <ShapesIcon className="hidden w-4 h-4 shrink-0 lg:block" />,
            multiple: true,
            children: options.map((e) => ({
              name: e.metadata.label,
              onClick: () =>
                setFilters((f: string[]) => {
                  if (f.includes(e._id)) return f.filter((el) => el != e._id);
                  return [...f, e._id];
                }),
              selected: filters.includes(e._id),
            })),
          },
          // ============================================================================================
          // if one filter is selected and subObject is filterable, display a sub-filter
          ...(filters.length === 1 &&
          selected_subobject &&
          // SubObject is contact
          // TODO: metadata.properties feature
          "value" in (selected_subobject.values.find((v) => v.label === "Nom") || {})
            ? [createContactSubFilter(subFilters, selected_subobject, sub_objects, setSubFilters)]
            : []),

          ...(filters.length === 1 &&
          selected_subobject &&
          // SubObject is occupation
          // TODO: metadata.properties feature
          "occupation" === selected_subobject?.metadata.label
            ? [createOccupationSubFilter(subFilters, selected_subobject, setSubFilters)]
            : []),
          // ============================================================================================
          {
            name: "",
            icon: (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <CircleXIcon className="w-4 h-4 shrink-0 lg:block" />
                  </TooltipTrigger>
                  <TooltipContent sideOffset={16} side="bottom">
                    Supprimer tous les filtres
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ),
            onClick: () => {
              setRegion("");
              setFilters([]);
              setSubFilters([]);
            },
          },
        ]}
      />
    </div>
  );
};

const createContactSubFilter = (
  subFilters: string[],
  selected_subobject: SubObjectDocument,
  sub_objects: GenericObject[],
  setSubFilters: Dispatch<SetStateAction<string[]>>,
) => {
  const children = sub_objects
    .map((e) => ({
      name: e.values.find((v: any) => v.label === "Nom")?.value.toString() || "",
      onClick: () =>
        setSubFilters((old) => {
          const contact_name = e.values.find((v) => v.label === "Nom")?.value.toString() || "";
          if (old.includes(contact_name)) return old.filter((el) => el !== contact_name);
          return [...old, contact_name];
        }),
      selected: subFilters.includes(e.values.find((v) => v.label === "Nom")?.value.toString() || ""),
    }))
    // ensure no empty names and no duplicates
    .filter((e) => e.name !== "")
    .reduce((acc, cur) => {
      if (acc.some((e) => e.name === cur.name)) return acc;
      return [...acc, cur];
    }, [] as Page[]);

  return {
    name: selected_subobject.metadata.label,
    icon: <CircleUserRoundIcon className="w-4 h-4 shrink-0 lg:block" />,
    children: children,
    multiple: true,
  } as Page;
};

const createOccupationSubFilter = (
  subFilters: string[],
  selected_subobject: SubObjectDocument,
  setSubFilters: Dispatch<SetStateAction<string[]>>,
) => {
  return {
    name: "Occupation",
    icon: <PaletteIcon className="w-4 h-4 shrink-0 lg:block" />,
    children: selected_subobject.values.map((e) => ({
      name: e.label.toString(),
      onClick: () =>
        setSubFilters((old) => {
          if (old.includes(e.label.toString())) return old.filter((el) => el !== e.label.toString());
          return [...old, e.label.toString()];
        }),
      selected: subFilters.includes(e.label.toString()),
    })),
    multiple: true,
  } as Page;
};
