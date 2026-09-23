import type { LayerSpecification, Map as MapLibreMap } from "maplibre-gl";

import type { RoadbookVectorPalette } from "./roadbook-map-style";

export const ROADBOOK_VECTOR_STYLE_URL =
  "https://tiles.openfreemap.org/styles/liberty";

type PaintProperty =
  | "background-color"
  | "fill-color"
  | "fill-extrusion-color"
  | "icon-color"
  | "line-color"
  | "text-color"
  | "text-halo-color";

function roadColor(layerId: string, palette: RoadbookVectorPalette) {
  if (layerId.includes("casing")) return palette.roadOutline;
  if (layerId.includes("rail")) return palette.roadOutline;
  if (/(motorway|trunk|primary)/.test(layerId)) return palette.roadMajor;
  if (/(path|pedestrian|service|track)/.test(layerId)) return palette.roadPath;
  return palette.roadMinor;
}

function setPaint(
  map: MapLibreMap,
  layer: LayerSpecification,
  property: PaintProperty,
  value: string,
) {
  try {
    map.setPaintProperty(layer.id, property, value);
  } catch {
    // OpenFreeMap can add or remove optional layers without breaking Roadbook.
  }
}

export function applyRoadbookVectorPalette(
  map: MapLibreMap,
  palette: RoadbookVectorPalette,
) {
  const layers = map.getStyle().layers ?? [];

  for (const layer of layers) {
    const sourceLayer = "source-layer" in layer ? layer["source-layer"] : "";

    if (layer.type === "raster") {
      map.setLayoutProperty(layer.id, "visibility", "none");
      continue;
    }

    if (layer.type === "background") {
      setPaint(map, layer, "background-color", palette.land);
      continue;
    }

    if (layer.type === "symbol") {
      setPaint(map, layer, "text-color", palette.label);
      setPaint(map, layer, "text-halo-color", palette.labelHalo);
      setPaint(map, layer, "icon-color", palette.label);
      continue;
    }

    if (sourceLayer === "water" || sourceLayer === "water_name") {
      setPaint(
        map,
        layer,
        layer.type === "line" ? "line-color" : "fill-color",
        palette.water,
      );
      continue;
    }

    if (sourceLayer === "waterway") {
      setPaint(map, layer, "line-color", palette.waterway);
      continue;
    }

    if (sourceLayer === "park") {
      setPaint(
        map,
        layer,
        layer.type === "line" ? "line-color" : "fill-color",
        palette.parks,
      );
      continue;
    }

    if (sourceLayer === "landcover" || sourceLayer === "landuse") {
      setPaint(
        map,
        layer,
        layer.type === "line" ? "line-color" : "fill-color",
        palette.landcover,
      );
      continue;
    }

    if (sourceLayer === "building") {
      setPaint(
        map,
        layer,
        layer.type === "fill-extrusion" ? "fill-extrusion-color" : "fill-color",
        palette.buildings,
      );
      continue;
    }

    if (sourceLayer === "aeroway") {
      setPaint(
        map,
        layer,
        layer.type === "line" ? "line-color" : "fill-color",
        palette.aeroway,
      );
      continue;
    }

    if (sourceLayer === "transportation") {
      if (layer.type === "fill")
        setPaint(map, layer, "fill-color", palette.roadMinor);
      if (layer.type === "line")
        setPaint(map, layer, "line-color", roadColor(layer.id, palette));
      continue;
    }

    if (sourceLayer === "boundary" && layer.type === "line")
      setPaint(map, layer, "line-color", palette.boundary);
  }
}

export function supportsRoadbookWebGL() {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: false,
    });
    const loseContext = context?.getExtension("WEBGL_lose_context");
    loseContext?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}
