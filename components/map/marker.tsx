// MarkerComponent.tsx
import { GenericObject } from "@/types/generic-object";
import { MARKER_ZOOM_IN } from "@components/map/component";
import { useCartographie } from "@components/map/context";
import L, { Map as MapType } from "leaflet";
import { useRouter } from "next/navigation";
import React from "react";
import { Marker } from "react-leaflet";

interface MarkerProps {
  e: GenericObject & {
    filters_passed: number;
    subfilters_passed?: number | undefined;
    subfilters_color?: string | undefined;
  };
  map: MapType | null;
  setSelectedSite: (site: GenericObject | null) => void;
}

const DELAY = 300;

export const MarkerComponent: React.FC<MarkerProps> = ({ e, map, setSelectedSite }) => {
  const { push } = useRouter();
  const { filters, selectedSite, sites } = useCartographie();
  const coordinates_raw = (e.values.find((v) => v.type === "coordinates")?.value as [string, string]) || ["0", "0"];
  const coordinates = [parseFloat(coordinates_raw[0]), parseFloat(coordinates_raw[1])] as [number, number];

  if (!coordinates[0] || !coordinates[1] || isNaN(coordinates[0]) || isNaN(coordinates[1])) return null;

  const isOnlyOneFilter = filters.length === 1;
  const hasOnlyBoolean = Object.values(e.children)
    .flat()
    .filter((c) => c._id === filters[0])
    .every((c) => c.values.every((v) => v.type === "boolean"));
  const hasEveryBooleanTrue = Object.values(e.children)
    .flat()
    .filter((c) => c._id === filters[0])
    .every((c) => c.values.every((v) => v.type === "boolean" && (v.value === "true" || v.value === true)));

  const showedColor = e.filters_passed !== 0 ? e.metadata.color || "#1440dc" : "#212121";

  const icon = L.divIcon({
    iconSize: [37, 50],
    iconAnchor: [19, 50],
    className: "",
    html: `<svg viewBox="0 0 70.12 99.99" class="relative z-10 ${
      selectedSite?._id === e._id ? "" : selectedSite ? "opacity-50" : "opacity-80"
    } hover:opacity-100 duration-200 ease-in-out transition-opacity">
    <g>
      <path
        class="${e.subfilters_color}"
      fill="${
        e.subfilters_color ? "currentColor" : showedColor
      }" d="m70.12,35.06c0,23.74-35.06,64.93-35.06,64.93,0,0-35.06-38.99-35.06-64.93C0,15.7,15.7,0,35.06,0s35.06,15.7,35.06,35.06Z"/>
    </g>
    <g>
      <text class="text-white font-title text-2xl font-bold" fill="currentColor" transform="translate(11.45 41.17)"><tspan x="0" y="0">${
        e.values.filter((el) => el.label === "Label")[0]?.value ?? "?"
      }</tspan></text>
    </g>
    ${
      e.filters_passed === 1 && isOnlyOneFilter && hasOnlyBoolean
        ? `<span class="absolute bg-white rounded-full py-1 px-0.5 z-[200] -top-3 border border-gray-300 -right-2 text-[#1440dc] text-xs leading-none">
            ${hasEveryBooleanTrue ? "✅" : "❌"}
            </span>`
        : ""
    }
    ${
      e.filters_passed > 1 || filters.length > 1
        ? `<span class="absolute bg-white rounded-full py-1 px-2 z-[200] -top-3 border border-gray-300 -right-2 text-[#1440dc] text-xs font-bold font-title leading-none">${e.filters_passed}</span>`
        : ""
    }
  </svg>`,
  });

  // eslint-disable-next-line no-undef
  let singleClickTimer: NodeJS.Timeout;
  let clickCount: number = 0;

  const calculateZoom = (map: MapType, coordinates: [number, number]) => {
    // if there is many markers in the area, we need to zoom more to see them all spread
    // get markers in the area (depends on the zoom level)
    const markersInArea = sites.filter((object) => {
      const object_coordinates = (
        (object.values.find((v) => v.type === "coordinates")?.value as [string, string]) || ["0", "0"]
      ).map(Number);
      return (
        L.latLng(object_coordinates[0], object_coordinates[1]).distanceTo(L.latLng(coordinates[0], coordinates[1])) <
        // depends on the zoom level
        (map.getZoom() < 10 ? 2000 : map.getZoom() < 12 ? 1000 : 500)
      );
    });
    if (markersInArea.length > 1) return MARKER_ZOOM_IN + 2;

    return map.getZoom() < MARKER_ZOOM_IN ? MARKER_ZOOM_IN : map.getZoom();
  };

  return (
    <Marker
      position={coordinates}
      key={e._id}
      icon={icon}
      eventHandlers={{
        click: () => {
          clickCount++;
          if (clickCount === 1) {
            singleClickTimer = setTimeout(() => {
              setSelectedSite(e);

              if (map && coordinates && !!singleClickTimer)
                map?.flyTo(coordinates, calculateZoom(map, coordinates), {
                  animate: true,
                  duration: 0.3,
                  noMoveStart: true,
                });

              clickCount = 0; // reset click count
            }, DELAY);
          } else if (clickCount === 2) {
            clearTimeout(singleClickTimer); // Cancel the single click event
            clickCount = 0; // reset click count
          }
        },
        dblclick: () => {
          push(`/generic-object/${e._id}`);
        },
      }}
    ></Marker>
  );
};
