import { GenericObject } from "@/types/generic-object";
import L, { Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

/**
 * A React component that displays a map with a single marker for a specific location.
 *
 * @remarks The component uses the `useEffect` hook to set the `mapRef` object in the parent component to the `map` object when it is available. The component renders a `MapContainer` component from `react-leaflet` with the coordinates of the location and a zoom level of 16. The component renders a `TileLayer` component from `react-leaflet` with the URL of the OpenStreetMap tile server. The component renders a `Marker` component from `react-leaflet` for the location with a custom `icon` object that displays a marker with a specific anchor point and icon image.
 *
 * @param props - An object that contains the data for the location, including its coordinates and ID.
 * @param props.mapRef - A mutable ref object that is used to store the `map` object in the parent component.
 *
 * @returns A React component that displays a map with a single marker for a specific location.
 */
export const MapDetails = (props: GenericObject & { mapRef: MutableRefObject<any> }) => {
  const [map, setMap] = useState<Map | null>(null);
  const icon = L.icon({
    iconUrl: "/img/marker-icon.png",
    iconAnchor: [10, 35],
  });

  let coordinates = (props.values.find((v) => v.type === "coordinates")?.value as [string, string]) || ["0", "0"];
  let intCoordinates = [parseFloat(coordinates[0]), parseFloat(coordinates[1])] as [number, number];

  useEffect(() => {
    if (map) props.mapRef.current = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return (
    <MapContainer center={intCoordinates} zoom={16} className="w-full h-full" scrollWheelZoom={false}>
      <MapEventHandler {...{ setMap }}></MapEventHandler>
      <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />

      <Marker position={intCoordinates} key={props._id} icon={icon}></Marker>
    </MapContainer>
  );
};

const MapEventHandler = ({ setMap }: { setMap: Dispatch<SetStateAction<Map | null>> }) => {
  const map = useMapEvents({});

  useEffect(() => {
    if (map) setMap(map);
  }, [map, setMap]);

  return null;
};
