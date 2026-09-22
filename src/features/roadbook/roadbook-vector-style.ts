import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";

import type { RoadbookVectorPalette } from "./roadbook-map-style";

export const ROADBOOK_VECTOR_SOURCE_URL =
  "https://tiles.openfreemap.org/planet";
export const ROADBOOK_VECTOR_ATTRIBUTION =
  "© OpenFreeMap · OpenStreetMap contributors";

const sourceId = "roadbook-openfreemap";
const lineLayout = {
  "line-cap": "round",
  "line-join": "round",
} as const;

const width = (...stops: number[]) =>
  ["interpolate", ["linear"], ["zoom"], ...stops] as const;

const classes = (values: string[]) =>
  ["in", ["get", "class"], ["literal", values]] as const;

export function buildRoadbookVectorStyle(
  palette: RoadbookVectorPalette,
): StyleSpecification {
  return {
    version: 8,
    sources: {
      [sourceId]: {
        type: "vector",
        url: ROADBOOK_VECTOR_SOURCE_URL,
        maxzoom: 14,
        attribution: ROADBOOK_VECTOR_ATTRIBUTION,
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": palette.land },
      },
      {
        id: "landcover",
        type: "fill",
        source: sourceId,
        "source-layer": "landcover",
        paint: {
          "fill-color": palette.landcover,
          "fill-opacity": 0.6,
        },
      },
      {
        id: "park",
        type: "fill",
        source: sourceId,
        "source-layer": "park",
        paint: { "fill-color": palette.parks, "fill-opacity": 1 },
      },
      {
        id: "water",
        type: "fill",
        source: sourceId,
        "source-layer": "water",
        paint: { "fill-color": palette.water, "fill-opacity": 1 },
      },
      {
        id: "waterway",
        type: "line",
        source: sourceId,
        "source-layer": "waterway",
        layout: lineLayout,
        paint: {
          "line-color": palette.waterway,
          "line-width": width(8, 0.3, 12, 0.9, 16, 2.4),
        },
      },
      {
        id: "aeroway",
        type: "line",
        source: sourceId,
        "source-layer": "aeroway",
        minzoom: 10,
        filter: classes(["runway", "taxiway"]),
        layout: lineLayout,
        paint: {
          "line-color": palette.aeroway,
          "line-width": width(11, 0.6, 14, 1.6, 16, 3),
        },
      },
      {
        id: "building",
        type: "fill",
        source: sourceId,
        "source-layer": "building",
        minzoom: 13,
        paint: {
          "fill-color": palette.buildings,
          "fill-opacity": width(13, 0, 14.5, 0.7),
        },
      },
      {
        id: "road-minor-casing",
        type: "line",
        source: sourceId,
        "source-layer": "transportation",
        minzoom: 9,
        filter: classes([
          "minor",
          "service",
          "residential",
          "secondary",
          "tertiary",
        ]),
        layout: lineLayout,
        paint: {
          "line-color": palette.roadOutline,
          "line-width": width(9, 1.3, 13, 3.4, 16, 5.4),
          "line-opacity": width(9, 0, 10.8, 0.6),
        },
      },
      {
        id: "road-minor",
        type: "line",
        source: sourceId,
        "source-layer": "transportation",
        minzoom: 9,
        filter: classes([
          "minor",
          "service",
          "residential",
          "secondary",
          "tertiary",
        ]),
        layout: lineLayout,
        paint: {
          "line-color": palette.roadMinor,
          "line-width": width(9, 0.75, 13, 2, 16, 4),
          "line-opacity": width(9, 0, 10.8, 1),
        },
      },
      {
        id: "road-major-casing",
        type: "line",
        source: sourceId,
        "source-layer": "transportation",
        minzoom: 7,
        filter: classes(["trunk", "primary", "motorway"]),
        layout: lineLayout,
        paint: {
          "line-color": palette.roadOutline,
          "line-width": width(7, 2.2, 12, 6, 16, 12),
          "line-opacity": width(7, 0, 8.6, 0.6),
        },
      },
      {
        id: "road-major",
        type: "line",
        source: sourceId,
        "source-layer": "transportation",
        minzoom: 7,
        filter: classes(["trunk", "primary", "motorway"]),
        layout: lineLayout,
        paint: {
          "line-color": palette.roadMajor,
          "line-width": width(7, 1.3, 12, 4, 16, 8),
          "line-opacity": width(7, 0, 8.6, 1),
        },
      },
      {
        id: "road-path",
        type: "line",
        source: sourceId,
        "source-layer": "transportation",
        minzoom: 12,
        filter: classes([
          "path",
          "track",
          "footway",
          "cycleway",
          "pedestrian",
          "steps",
        ]),
        layout: lineLayout,
        paint: {
          "line-color": palette.roadPath,
          "line-width": width(12, 0.6, 16, 1.5),
          "line-opacity": width(12, 0, 13.2, 0.85),
        },
      },
      {
        id: "rail",
        type: "line",
        source: sourceId,
        "source-layer": "transportation",
        minzoom: 9,
        filter: classes(["rail", "transit"]),
        layout: lineLayout,
        paint: {
          "line-color": palette.roadOutline,
          "line-width": width(9, 0.35, 14, 1),
          "line-opacity": 0.45,
        },
      },
    ],
  } as unknown as StyleSpecification;
}

const palettePaintProperties = (
  palette: RoadbookVectorPalette,
): ReadonlyArray<readonly [string, string, string]> => [
  ["background", "background-color", palette.land],
  ["landcover", "fill-color", palette.landcover],
  ["park", "fill-color", palette.parks],
  ["water", "fill-color", palette.water],
  ["waterway", "line-color", palette.waterway],
  ["aeroway", "line-color", palette.aeroway],
  ["building", "fill-color", palette.buildings],
  ["road-minor-casing", "line-color", palette.roadOutline],
  ["road-minor", "line-color", palette.roadMinor],
  ["road-major-casing", "line-color", palette.roadOutline],
  ["road-major", "line-color", palette.roadMajor],
  ["road-path", "line-color", palette.roadPath],
  ["rail", "line-color", palette.roadOutline],
];

export function applyRoadbookVectorPalette(
  map: MapLibreMap,
  palette: RoadbookVectorPalette,
) {
  for (const [layerId, property, value] of palettePaintProperties(palette)) {
    if (map.getLayer(layerId)) map.setPaintProperty(layerId, property, value);
  }
}

export function supportsRoadbookWebGL() {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    const loseContext = context?.getExtension("WEBGL_lose_context");
    loseContext?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}
