import { roadbookMapModes, type RoadbookMapMode } from "./roadbook-schema";

export const ROADBOOK_STYLE_STORAGE_KEY = "capcar.roadbook.map-style.v1";
export const ROADBOOK_DEFAULT_STYLE: RoadbookMapMode = "tokyo";

export type RoadbookMapStyle = Readonly<{
  id: RoadbookMapMode;
  name: string;
  description: string;
  canvas: string;
  accent: string;
  swatch: readonly [string, string, string];
  tileFilter: string;
}>;

export const ROADBOOK_MAP_STYLES = {
  konstanz: {
    id: "konstanz",
    name: "Konstanz",
    description: "Clean lakeside daylight",
    canvas: "#dce7e2",
    accent: "#176b63",
    swatch: ["#f5efe2", "#176b63", "#9eb8c2"],
    tileFilter: "saturate(.82) hue-rotate(7deg) brightness(1.04) contrast(.92)",
  },
  reykjavik: {
    id: "reykjavik",
    name: "Reykjavík",
    description: "Cold mineral clarity",
    canvas: "#cbd7dc",
    accent: "#6ba8c1",
    swatch: ["#dce7ea", "#68767b", "#8fc7dd"],
    tileFilter:
      "grayscale(.4) sepia(.1) hue-rotate(150deg) saturate(.72) brightness(.94) contrast(1.18)",
  },
  lissabon: {
    id: "lissabon",
    name: "Lissabon",
    description: "Sun-washed Atlantic warmth",
    canvas: "#e8d4bc",
    accent: "#b75f45",
    swatch: ["#f3ead8", "#b9684c", "#477a91"],
    tileFilter:
      "sepia(.38) saturate(1.12) hue-rotate(342deg) brightness(1.01) contrast(.98)",
  },
  wien: {
    id: "wien",
    name: "Wien",
    description: "Elegant warm stone",
    canvas: "#ddd3c1",
    accent: "#7d293d",
    swatch: ["#e9dfcd", "#82786d", "#7d293d"],
    tileFilter:
      "grayscale(.18) sepia(.25) saturate(.68) brightness(1.04) contrast(.94)",
  },
  zurich: {
    id: "zurich",
    name: "Zürich",
    description: "Precise neutral structure",
    canvas: "#dde1e1",
    accent: "#356b88",
    swatch: ["#f4f5f2", "#404748", "#527f99"],
    tileFilter: "grayscale(.75) saturate(.45) brightness(1.04) contrast(1.16)",
  },
  venedig: {
    id: "venedig",
    name: "Venedig",
    description: "Parchment and lagoon",
    canvas: "#c9c7aa",
    accent: "#477c72",
    swatch: ["#e8ddbd", "#477c72", "#b8755e"],
    tileFilter:
      "sepia(.34) hue-rotate(112deg) saturate(.8) brightness(.94) contrast(1.02)",
  },
  kyoto: {
    id: "kyoto",
    name: "Kyoto",
    description: "Warm paper and vermilion",
    canvas: "#d9ccb3",
    accent: "#a34132",
    swatch: ["#eadfc7", "#393633", "#a34132"],
    tileFilter:
      "sepia(.45) saturate(.72) hue-rotate(326deg) brightness(.91) contrast(1.12)",
  },
  marrakesch: {
    id: "marrakesch",
    name: "Marrakesch",
    description: "Sand, ochre and palm",
    canvas: "#c99562",
    accent: "#7a6942",
    swatch: ["#d8b27d", "#a75d35", "#617052"],
    tileFilter:
      "sepia(.62) saturate(1.18) hue-rotate(338deg) brightness(.91) contrast(1.08)",
  },
  tokyo: {
    id: "tokyo",
    name: "Tokyo",
    description: "Petrol-black night network",
    canvas: "#050b0d",
    accent: "#e72d45",
    swatch: ["#071a1c", "#164b4d", "#e72d45"],
    tileFilter:
      "grayscale(.72) sepia(.6) hue-rotate(132deg) saturate(1.58) brightness(.34) contrast(1.38)",
  },
} as const satisfies Record<RoadbookMapMode, RoadbookMapStyle>;

export function isRoadbookMapMode(value: unknown): value is RoadbookMapMode {
  return (
    typeof value === "string" && roadbookMapModes.some((mode) => mode === value)
  );
}

export function readRoadbookMapStyle(
  storage?: Pick<Storage, "getItem">,
): RoadbookMapMode {
  if (!storage) return ROADBOOK_DEFAULT_STYLE;
  try {
    const value = storage.getItem(ROADBOOK_STYLE_STORAGE_KEY);
    return isRoadbookMapMode(value) ? value : ROADBOOK_DEFAULT_STYLE;
  } catch {
    return ROADBOOK_DEFAULT_STYLE;
  }
}

export function writeRoadbookMapStyle(
  mode: RoadbookMapMode,
  storage?: Pick<Storage, "setItem">,
) {
  if (!storage) return;
  try {
    storage.setItem(ROADBOOK_STYLE_STORAGE_KEY, mode);
  } catch {
    // Storage failures must never prevent map use.
  }
}

export type TileRecoveryState = Readonly<{
  failures: number;
  fallbackAttempted: boolean;
}>;
export type TileRecoveryAction = "wait" | "fallback" | "error";

export function recoverRoadbookTiles(
  state: TileRecoveryState,
  hasLoadedTiles: boolean,
): { state: TileRecoveryState; action: TileRecoveryAction } {
  if (hasLoadedTiles)
    return {
      state: { failures: 0, fallbackAttempted: state.fallbackAttempted },
      action: "wait",
    };
  const failures = state.failures + 1;
  if (failures < 4) return { state: { ...state, failures }, action: "wait" };
  if (!state.fallbackAttempted)
    return {
      state: { failures: 0, fallbackAttempted: true },
      action: "fallback",
    };
  return { state: { failures, fallbackAttempted: true }, action: "error" };
}
