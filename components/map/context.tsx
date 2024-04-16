import { useAuth } from "@/hooks/useAuth";
import { getAllSubObject } from "@/lib/fetchers/sub-object";
import { createPersistedState } from "@/lib/use-persisted-state";
import { getEntityFromContact } from "@/lib/user";
import { SubObjectDocument, SubObjectType } from "@/models";
import { GenericObject } from "@/types/generic-object";
import { regions_obj } from "@resources/regions";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useMemo, useState } from "react";

// GENERAL DATA
export const DEFAULT_MAP_ZOOM = 8;
export const DEFAULT_MAP_POSITION = regions_obj.reduce(
  (acc, { value, center }) => ({ ...acc, [value]: center as [number, number] }),
  {} as Record<string, [number, number]>,
);

// CONTEXT
const CartographieContext = createContext({});

/**
 * The type for the CartographieContext object.
 *
 * @remarks The type defines the shape of the context object used by the `CartographieContext` context. The object contains properties for the current map position and zoom level, the selected region, the current filters, the list of sites, and the currently selected site. The `filtered` property is a derived property that contains the sites that pass the current filters.
 *
 * @typedef {Object} CartographieContextType
 * @property {[number, number]} position - The current map position as a tuple of latitude and longitude.
 * @property {number} zoom - The current map zoom level.
 * @property {string[]} filters - The current filters applied to the site list. (ex: domaines ["irve", "vel prévision"])
 * @property {Dispatch<SetStateAction<string[]>>} setFilters - A function to set the current filters.
 * @property {string} region - The currently selected region.
 * @property {(region: string) => void} setRegion - A function to set the currently selected region.
 * @property {GenericObject[]} sites - The list of sites to display on the map.
 * @property {GenericObject | null} selectedSite - The currently selected site, or null if no site is selected.
 * @property {(site: GenericObject | null) => void} setSelectedSite - A function to set the currently selected site.
 * @property {(GenericObject & { passFilters: number })[]} filtered - A derived property that contains the sites that pass the current filters.
 */
type CartographieContextType = {
  position: [number, number];
  zoom: number;

  region: string;
  setRegion: (region: string) => void;
  sites: GenericObject[];
  selectedSite: GenericObject | null;
  setSelectedSite: (site: GenericObject | null) => void;

  isCluster: boolean;
  setIsCluster: Dispatch<SetStateAction<boolean>>;

  filters: string[];
  setFilters: Dispatch<SetStateAction<string[]>>;
  filters_options: SubObjectDocument[];
  setFiltersOptions: Dispatch<SetStateAction<SubObjectDocument[]>>;
  subFilters: string[];
  setSubFilters: Dispatch<SetStateAction<string[]>>;

  filtered: (GenericObject & { filters_passed: number; subfilters_passed?: number; subfilters_color?: string })[];
};

const useCluster = createPersistedState("toggle-cluster");

/**
 * A custom hook that returns the `CartographieContext` object.
 *
 * @remarks The hook is created using the `useContext` hook from the `react` library, and returns the `CartographieContext` object. If the context is not found, the function throws an error.
 *
 * @returns The `CartographieContext` object.
 *
 * @example
 * const { position, zoom, filters, setFilters, region, setRegion, sites, selectedSite, setSelectedSite, filtered } = useCartographie();
 */
export const useCartographie = () => {
  const context = useContext(CartographieContext);
  if (!context) {
    throw new Error("useCartographie must be used within a CartographieProvider");
  }
  return context as CartographieContextType;
};

/**
 * A React component that provides the `CartographieContext` context.
 *
 * @remarks The component takes two props: `children`, which is the child component or components that will have access to the context, and `initialSites`, which is an array of `GenericObject` objects that represent the sites to display on the map. The component uses the `useState` hook to manage the current map zoom level, the current filters, the currently selected site, the currently selected region, and the current map position. The component uses the `useMemo` hook to derive the `filtered` property, which contains the sites that pass the current filters and region.
 *
 * @param children - The child component or components that will have access to the context.
 * @param initialSites - An array of `GenericObject` objects that represent the sites to display on the map.
 *
 * @returns A React component that provides the `CartographieContext` context.
 *
 * @example
 * <CartographieProvider initialSites={sites}>
 *   <App />
 * </CartographieProvider>
 */
export const CartographieProvider = ({
  children,
  initialSites = [],
}: {
  children: ReactNode;
  initialSites: GenericObject[];
}) => {
  const { user } = useAuth();
  const entity = getEntityFromContact(user);

  const [selectedSite, setSelectedSite] = useState<GenericObject | null>(null);
  const [region, setRegion] = useState(entity || "");
  const [position, setPosition] = useState([NaN, NaN]);

  const [isCluster, setIsCluster] = useCluster(true);

  const [filters, setFilters] = useState<string[]>([]);
  const [filters_options, setFiltersOptions] = useState<SubObjectType[]>([]);
  const [subFilters, setSubFilters] = useState<string[]>([]);

  useEffect(() => {
    getAllSubObject().then(setFiltersOptions);
  }, []);

  useEffect(() => {
    if (filters.length > 1) setSubFilters([]);
  }, [filters]);

  useEffect(() => {
    if (entity) {
      setRegion(entity);
      setPosition(DEFAULT_MAP_POSITION[entity]);
    } else {
      setPosition(DEFAULT_MAP_POSITION[""]);
    }
  }, [entity]);

  const filtered = useMemo(
    () =>
      initialSites
        .filter(hasCoordinates)
        .filter((s: GenericObject) => matchesRegion(s, region))
        .map((s) => {
          return {
            ...s,
            filters_passed: filters.length === 0 ? -1 : countFiltersPassed(s, filters),
            subfilters_passed: countSubfiltersPassed(s, filters, subFilters),
            subfilters_color: getSubfiltersColor(s, filters, subFilters),
          };
        }),
    [initialSites, filters, region, subFilters],
  );

  return (
    <CartographieContext.Provider
      value={{
        position,
        zoom: DEFAULT_MAP_ZOOM,
        region,
        setRegion,
        sites: initialSites,
        selectedSite,
        setSelectedSite,

        isCluster,
        setIsCluster,

        filters,
        setFilters,
        filters_options,
        setFiltersOptions,
        subFilters,
        setSubFilters,

        filtered,
      }}
    >
      {children}
    </CartographieContext.Provider>
  );
};

// Helper function to check if site has coordinates
const hasCoordinates = (s: GenericObject) => s.values.some((v) => v.type === "coordinates");

// Helper function to check if site matches region
const matchesRegion = (s: GenericObject, region: string) => {
  if (region === "") return true;
  return s.metadata.entity === region;
};

// Helper function to count filters passed
const countFiltersPassed = (s: GenericObject, filters: string[]) => {
  const sub_objects = Object.values(s.children ?? {}).flat();
  return filters.filter((f) => sub_objects.some((so) => so._id === f)).length;
};

// Helper function to count subfilters passed
const countSubfiltersPassed = (s: GenericObject, filters: string[], subFilters: string[]) => {
  if (filters.length !== 1) return 0;
  return Object.values(s.children ?? {})
    .flat()
    .filter((so) => so._id === filters[0])
    .filter((so) => so.values.some((v) => subFilters.includes(v.value as string))).length;
};

// Helper function to get subfilters color
const getSubfiltersColor = (s: GenericObject, filters: string[], subFilters: string[]) => {
  if (filters.length !== 1) return undefined;
  return [undefined, "text-amber-500", "text-purple-500", "text-emerald-500", "text-lime-500", "text-pink-500"].at(
    subFilters.indexOf(
      Object.values(s.children ?? {})
        .flat()
        .find((so) => so._id === filters[0])
        ?.values.find((v) => subFilters.includes(v.value as string))?.value as string,
    ) + 1, // warning: +1 because of undefined
  );
};
