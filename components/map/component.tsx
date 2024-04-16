import { GenericObject } from "@/types/generic-object";
import { DEFAULT_MAP_POSITION, DEFAULT_MAP_ZOOM, useCartographie } from "@components/map/context";
import { LatLngTuple, Map as MapType } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";

import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import { MarkerComponent } from "@components/map/marker";
require("@changey/react-leaflet-markercluster/dist/styles.min.css");

/**
 * A React component that displays a map of the region with markers for each site.
 *
 * @remarks The component uses the `useCartographie` hook to get the current position, zoom level, filtered sites, and the `setSelectedSite` function. The component uses the `useState` hook to keep track of the `map` object. The component renders a `MapContainer` component from `react-leaflet` with the current position and zoom level. The component renders a `TileLayer` component from `react-leaflet` with the URL of the OpenStreetMap tile server. The component renders a `Marker` component from `react-leaflet` for each filtered site. The component uses a custom `icon` object to display a marker with a label and a color that indicates whether the site passes the current filters. The component uses the `setSelectedSite` function to set the selected site when a marker is clicked. The component also uses the `map` object to fly to the selected marker when it is clicked.
 *
 * @returns A React component that displays a map of the region with markers for each site.
 */
const Map = (): JSX.Element => {
  const { position, zoom, filtered, setSelectedSite, isCluster, region } = useCartographie();
  const [map, setMap] = useState<MapType | null>(null);

  const filteredMarkers = useMemo(() => {
    return filtered.map((e) => <MarkerComponent e={e} key={e._id} map={map} setSelectedSite={setSelectedSite} />);
  }, [filtered, map, setSelectedSite]);

  useEffect(() => {
    if (map)
      map.flyTo(DEFAULT_MAP_POSITION[region], region !== "" ? DEFAULT_MAP_ZOOM : DEFAULT_MAP_ZOOM - 2, {
        duration: 1,
      });
  }, [region, map]);

  return !position?.every((p) => isNaN(p)) ? (
    <MapContainer
      zoomSnap={0.1}
      center={position}
      zoom={zoom}
      scrollWheelZoom={true}
      className="relative z-[8] w-full h-full"
    >
      <MapEventHandler {...{ setMap }}></MapEventHandler>

      <TileLayer url="http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
      {isCluster ? (
        <MarkerClusterGroup disableClusteringAtZoom={11} spiderfyOnMaxZoom={false}>
          {filteredMarkers}
        </MarkerClusterGroup>
      ) : (
        filteredMarkers
      )}
    </MapContainer>
  ) : (
    <></>
  );
};

export default Map;

const getCoordinates = (marker: GenericObject): LatLngTuple => {
  if (!marker) return [0, 0];
  const coordinates = marker.values.find((v) => v.type === "coordinates");
  if (coordinates) return coordinates.value as unknown as LatLngTuple;

  return [0, 0];
};

export const MARKER_ZOOM_IN = 13;
export const MARKER_ZOOM_OUT = 9;

/**
 * A React component that handles map events.
 *
 * @remarks The component uses the `useCartographie` hook to get the current region, selected site, and the `setSelectedSite` function. The component uses the `useMapEvents` hook from `react-leaflet` to handle the `click` event on the map. When the map is clicked, the component checks if there is a selected site. If there is, the component zooms out to show all the sites on the map. If there isn't, the component zooms in to the default position and zoom level. The component also clears the selected site when the map is clicked.
 *
 * @param setMap - The function to set the `map` object in the parent component.
 *
 * @returns A React component that handles map events.
 */
const MapEventHandler = ({ setMap }: { setMap: Dispatch<SetStateAction<MapType | null>> }) => {
  const { region, selectedSite: selected, setSelectedSite: setSelected } = useCartographie();
  const map = useMapEvents({
    click: (_e) => {
      if (!region) return;
      if (selected)
        map.flyTo(getCoordinates(selected), MARKER_ZOOM_OUT, {
          animate: true,
          duration: 0.3,
        });
      else
        map.flyTo(DEFAULT_MAP_POSITION[region], DEFAULT_MAP_ZOOM, {
          animate: true,
          duration: 0.2,
        });

      setSelected(null);
    },
  });

  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);

  return null;
};
