import type L from "leaflet";

import type { RoadbookVectorPalette } from "./roadbook-map-style";

export const ROADBOOK_VECTOR_TILEJSON_URL =
  "https://tiles.openfreemap.org/planet";

export type RoadbookVectorProvider = Readonly<{
  tileUrl: string;
  layerIds: readonly string[];
}>;

type VectorLayerStyle =
  | L.PathOptions
  | L.PathOptions[]
  | ((properties: Record<string, string>, zoom: number) => L.PathOptions[]);

const majorRoads = new Set(["motorway", "trunk", "primary"]);
const paths = new Set([
  "path",
  "track",
  "footway",
  "cycleway",
  "pedestrian",
  "steps",
]);

function roadWeight(zoom: number, roadClass: string) {
  if (majorRoads.has(roadClass)) return Math.max(1.35, (zoom - 6) * 0.88);
  if (paths.has(roadClass)) return Math.max(0.45, (zoom - 10) * 0.28);
  return Math.max(0.75, (zoom - 8) * 0.52);
}

function roadColor(roadClass: string, palette: RoadbookVectorPalette) {
  if (majorRoads.has(roadClass)) return palette.roadMajor;
  if (paths.has(roadClass)) return palette.roadPath;
  return palette.roadMinor;
}

export function parseRoadbookVectorProvider(
  value: unknown,
): RoadbookVectorProvider | null {
  if (!value || typeof value !== "object") return null;
  const tileJson = value as {
    tiles?: unknown;
    vector_layers?: unknown;
  };
  const tileUrl = Array.isArray(tileJson.tiles)
    ? tileJson.tiles.find((tile): tile is string => typeof tile === "string")
    : undefined;
  if (!tileUrl || !tileUrl.startsWith("https://tiles.openfreemap.org/"))
    return null;

  const layerIds = Array.isArray(tileJson.vector_layers)
    ? tileJson.vector_layers
        .map((layer) =>
          layer && typeof layer === "object" && "id" in layer
            ? (layer as { id?: unknown }).id
            : undefined,
        )
        .filter((id): id is string => typeof id === "string")
    : [];

  return layerIds.length > 0 ? { tileUrl, layerIds } : null;
}

export function createRoadbookVectorLayerStyles(
  palette: RoadbookVectorPalette,
  layerIds: readonly string[],
) {
  const styles: Record<string, VectorLayerStyle | []> = Object.fromEntries(
    layerIds.map((id) => [id, []]),
  );

  styles.landcover = {
    fill: true,
    fillColor: palette.landcover,
    fillOpacity: 0.64,
    stroke: false,
  };
  styles.landuse = styles.landcover;
  styles.park = {
    fill: true,
    fillColor: palette.parks,
    fillOpacity: 0.9,
    stroke: false,
  };
  styles.water = {
    fill: true,
    fillColor: palette.water,
    fillOpacity: 1,
    stroke: false,
  };
  styles.waterway = {
    color: palette.waterway,
    opacity: 0.9,
    weight: 1.1,
  };
  styles.aeroway = {
    color: palette.aeroway,
    fill: true,
    fillColor: palette.aeroway,
    fillOpacity: 0.8,
    opacity: 0.85,
    weight: 1.2,
  };
  styles.building = (_properties, zoom) =>
    zoom < 13
      ? []
      : [
          {
            fill: true,
            fillColor: palette.buildings,
            fillOpacity: Math.min(0.72, (zoom - 12.5) * 0.32),
            stroke: false,
          },
        ];
  styles.boundary = {
    color: palette.boundary,
    dashArray: "4 4",
    opacity: 0.5,
    weight: 0.8,
  };
  styles.transportation = (properties, zoom) => {
    const roadClass = properties.class ?? "";
    const isPath = paths.has(roadClass);
    if (isPath && zoom < 12) return [];
    if (!majorRoads.has(roadClass) && !isPath && zoom < 9) return [];
    const weight = roadWeight(zoom, roadClass);
    return [
      {
        color: palette.roadOutline,
        lineCap: "round",
        lineJoin: "round",
        opacity: isPath ? 0.45 : 0.78,
        weight: weight + Math.max(0.75, weight * 0.42),
      },
      {
        color: roadColor(roadClass, palette),
        lineCap: "round",
        lineJoin: "round",
        opacity: isPath ? 0.82 : 1,
        weight,
      },
    ];
  };

  return styles;
}
