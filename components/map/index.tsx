import dynamic from "next/dynamic";

import { GenericObject } from "@/types/generic-object";
import { CartographieProvider, useCartographie } from "@components/map/context";
import { Filters } from "@components/map/filters";
import { Information } from "@components/map/panel";
import { ToggleList } from "@components/map/toggle-list";
import { PageLoader } from "@components/ui/loader/page";

export type MapObject = {
  flyTo: (
    coords: [number, number],
    zoom: number,
    options: {
      animate: boolean;
      duration: number;
    },
  ) => void;
};

const Map = dynamic(() => import("@components/map/component"), {
  ssr: false,
  loading: () => <PageLoader />,
});

/**
 * A React component that serves as the main application component.
 *
 * @remarks The component uses the `useCartographie` hook to get the current selected site and the `setSelectedSite` function. The component renders a `Map` component that displays the map of the region. The component renders a `Filter` component that allows the user to filter the sites displayed on the map. The component renders a `Table` component that displays the sites that match the current filter. The component renders an `Information` component that displays detailed information about the selected site, if any. The `Information` component is only rendered if there is a selected site. The `setSelectedSite` function is passed down to the `Information` component to allow it to clear the selection when the "Close" button is clicked.
 *
 * @returns A React component that serves as the main application component.
 */
const App = () => {
  const { selectedSite: site, setSelectedSite } = useCartographie();
  return (
    <section id="map-container" className="w-full h-full">
      <div className="absolute top-0 w-full h-full">
        <Map />
      </div>
      <Filters />
      <ToggleList />
      {site && <Information {...{ object: site, setSelectedSite }} />}
    </section>
  );
};

export const CartographieApp = ({ sites }: { sites: GenericObject[] }) => {
  return (
    <CartographieProvider initialSites={sites}>
      <App />
    </CartographieProvider>
  );
};
