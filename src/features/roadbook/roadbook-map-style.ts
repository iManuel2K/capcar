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
  wash: string;
}>;

export const ROADBOOK_MAP_STYLES = {
  konstanz: {
    id: "konstanz",
    name: "Konstanz",
    description: "Clean lakeside daylight",
    canvas: "#dce7e2",
    accent: "#176b63",
    swatch: ["#f5efe2", "#176b63", "#9eb8c2"],
    tileFilter:
      "grayscale(.34) sepia(.18) hue-rotate(132deg) saturate(.9) brightness(.76) contrast(1.34)",
    wash: "rgb(21 74 82 / 20%)",
  },
  reykjavik: {
    id: "reykjavik",
    name: "Reykjavík",
    description: "Cold mineral clarity",
    canvas: "#cbd7dc",
    accent: "#6ba8c1",
    swatch: ["#dce7ea", "#68767b", "#8fc7dd"],
    tileFilter:
      "grayscale(.68) sepia(.08) hue-rotate(150deg) saturate(.72) brightness(.82) contrast(1.35)",
    wash: "rgb(133 169 183 / 16%)",
  },
  lissabon: {
    id: "lissabon",
    name: "Lissabon",
    description: "Sun-washed Atlantic warmth",
    canvas: "#e8d4bc",
    accent: "#b75f45",
    swatch: ["#f3ead8", "#b9684c", "#477a91"],
    tileFilter:
      "sepia(.64) saturate(1.4) hue-rotate(334deg) brightness(.78) contrast(1.28)",
    wash: "rgb(157 77 44 / 17%)",
  },
  wien: {
    id: "wien",
    name: "Wien",
    description: "Elegant warm stone",
    canvas: "#ddd3c1",
    accent: "#7d293d",
    swatch: ["#e9dfcd", "#82786d", "#7d293d"],
    tileFilter:
      "grayscale(.52) sepia(.86) saturate(1.9) hue-rotate(352deg) brightness(.34) contrast(1.62)",
    wash: "rgb(82 61 19 / 14%)",
  },
  zurich: {
    id: "zurich",
    name: "Zürich",
    description: "Precise neutral structure",
    canvas: "#dde1e1",
    accent: "#356b88",
    swatch: ["#f4f5f2", "#404748", "#527f99"],
    tileFilter: "grayscale(.92) saturate(.35) brightness(.68) contrast(1.46)",
    wash: "rgb(111 125 132 / 14%)",
  },
  venedig: {
    id: "venedig",
    name: "Venedig",
    description: "Parchment and lagoon",
    canvas: "#c9c7aa",
    accent: "#477c72",
    swatch: ["#e8ddbd", "#477c72", "#b8755e"],
    tileFilter:
      "sepia(.54) hue-rotate(88deg) saturate(.86) brightness(.74) contrast(1.26)",
    wash: "rgb(66 111 101 / 18%)",
  },
  kyoto: {
    id: "kyoto",
    name: "Kyoto",
    description: "Warm paper and vermilion",
    canvas: "#d9ccb3",
    accent: "#a34132",
    swatch: ["#eadfc7", "#393633", "#a34132"],
    tileFilter:
      "grayscale(.66) sepia(.34) saturate(.62) hue-rotate(35deg) brightness(.68) contrast(1.36)",
    wash: "rgb(91 96 69 / 15%)",
  },
  marrakesch: {
    id: "marrakesch",
    name: "Marrakesch",
    description: "Sand, ochre and palm",
    canvas: "#c99562",
    accent: "#7a6942",
    swatch: ["#d8b27d", "#a75d35", "#617052"],
    tileFilter:
      "sepia(.82) saturate(1.12) hue-rotate(344deg) brightness(.7) contrast(1.32)",
    wash: "rgb(139 92 38 / 19%)",
  },
  tokyo: {
    id: "tokyo",
    name: "Tokyo",
    description: "Petrol-black night network",
    canvas: "#050b0d",
    accent: "#e72d45",
    swatch: ["#071a1c", "#164b4d", "#e72d45"],
    tileFilter:
      "grayscale(.84) sepia(.72) hue-rotate(126deg) saturate(2.35) brightness(.28) contrast(1.78)",
    wash: "rgb(0 78 84 / 20%)",
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
