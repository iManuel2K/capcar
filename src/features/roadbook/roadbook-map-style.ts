import { roadbookMapModes, type RoadbookMapMode } from "./roadbook-schema";

export const ROADBOOK_STYLE_STORAGE_KEY = "capcar.roadbook.map-style.v1";
export const ROADBOOK_DEFAULT_STYLE: RoadbookMapMode = "tokyo";

export type RoadbookVectorPalette = Readonly<{
  land: string;
  landcover: string;
  parks: string;
  water: string;
  waterway: string;
  buildings: string;
  aeroway: string;
  roadMajor: string;
  roadMinor: string;
  roadPath: string;
  roadOutline: string;
  label: string;
  labelHalo: string;
  boundary: string;
}>;

export type RoadbookMapStyle = Readonly<{
  id: RoadbookMapMode;
  name: string;
  description: string;
  canvas: string;
  accent: string;
  swatch: readonly [string, string, string];
  tileFilter: string;
  wash: string;
  vector: RoadbookVectorPalette;
}>;

export const ROADBOOK_MAP_STYLES = {
  konstanz: {
    id: "konstanz",
    name: "Konstanz",
    description: "Clean lakeside daylight",
    canvas: "#eef3f4",
    accent: "#123243",
    swatch: ["#eef3f4", "#123243", "#2f6f8f"],
    tileFilter:
      "grayscale(.34) sepia(.18) hue-rotate(132deg) saturate(.9) brightness(.86) contrast(1.22)",
    wash: "rgb(21 74 82 / 10%)",
    vector: {
      land: "#eef3f4",
      landcover: "#dce8ea",
      parks: "#cfe0dd",
      water: "#2f6f8f",
      waterway: "#2a6280",
      buildings: "#dde6e8",
      aeroway: "#dde6e8",
      roadMajor: "#123243",
      roadMinor: "#2f5f72",
      roadPath: "#a7c0c7",
      roadOutline: "#e6eeef",
      label: "#173642",
      labelHalo: "#eef3f4",
      boundary: "#8aa2aa",
    },
  },
  reykjavik: {
    id: "reykjavik",
    name: "Reykjavík",
    description: "Burgundy polar night",
    canvas: "#2c1016",
    accent: "#f3d2d8",
    swatch: ["#2c1016", "#cf8f9b", "#f3d2d8"],
    tileFilter:
      "grayscale(.62) sepia(.78) hue-rotate(292deg) saturate(1.65) brightness(.32) contrast(1.5)",
    wash: "rgb(73 17 31 / 20%)",
    vector: {
      land: "#2c1016",
      landcover: "#3a1820",
      parks: "#231a16",
      water: "#1f0d14",
      waterway: "#3a1a26",
      buildings: "#3a1c24",
      aeroway: "#3a1c24",
      roadMajor: "#f3d2d8",
      roadMinor: "#cf8f9b",
      roadPath: "#5e3a44",
      roadOutline: "#190a0f",
      label: "#f3d2d8",
      labelHalo: "#2c1016",
      boundary: "#6f3a46",
    },
  },
  lissabon: {
    id: "lissabon",
    name: "Lissabon",
    description: "Sun-washed Atlantic warmth",
    canvas: "#f5ecdc",
    accent: "#b53a26",
    swatch: ["#f5ecdc", "#b53a26", "#8fbcd6"],
    tileFilter:
      "sepia(.64) saturate(1.4) hue-rotate(334deg) brightness(.88) contrast(1.18)",
    wash: "rgb(157 77 44 / 9%)",
    vector: {
      land: "#f5ecdc",
      landcover: "#efd9bb",
      parks: "#d2cf92",
      water: "#8fbcd6",
      waterway: "#71a6c6",
      buildings: "#efd9bb",
      aeroway: "#efd9bb",
      roadMajor: "#b53a26",
      roadMinor: "#cf6f44",
      roadPath: "#e6c4a0",
      roadOutline: "#f7efe1",
      label: "#6f281d",
      labelHalo: "#f5ecdc",
      boundary: "#cc8d70",
    },
  },
  wien: {
    id: "wien",
    name: "Wien",
    description: "Midnight blue and Vienna gold",
    canvas: "#101626",
    accent: "#f0cf7a",
    swatch: ["#101626", "#f0cf7a", "#d9b25c"],
    tileFilter:
      "grayscale(.52) sepia(.86) saturate(1.9) hue-rotate(352deg) brightness(.34) contrast(1.62)",
    wash: "rgb(17 22 38 / 18%)",
    vector: {
      land: "#101626",
      landcover: "#141b2c",
      parks: "#13201f",
      water: "#0b101d",
      waterway: "#16243a",
      buildings: "#19202f",
      aeroway: "#19202f",
      roadMajor: "#f0cf7a",
      roadMinor: "#d9b25c",
      roadPath: "#6f5836",
      roadOutline: "#080b14",
      label: "#f7e8bd",
      labelHalo: "#101626",
      boundary: "#5b4b2c",
    },
  },
  zurich: {
    id: "zurich",
    name: "Zürich",
    description: "Precise neutral structure",
    canvas: "#f4f6f8",
    accent: "#161b22",
    swatch: ["#f4f6f8", "#161b22", "#b7cdde"],
    tileFilter: "grayscale(.92) saturate(.35) brightness(.82) contrast(1.34)",
    wash: "rgb(111 125 132 / 8%)",
    vector: {
      land: "#f4f6f8",
      landcover: "#e6ebef",
      parks: "#d4dde2",
      water: "#b7cdde",
      waterway: "#9ebace",
      buildings: "#e4e9ed",
      aeroway: "#e4e9ed",
      roadMajor: "#161b22",
      roadMinor: "#3f4954",
      roadPath: "#b6bdc6",
      roadOutline: "#eef2f5",
      label: "#161b22",
      labelHalo: "#f4f6f8",
      boundary: "#86929e",
    },
  },
  venedig: {
    id: "venedig",
    name: "Venedig",
    description: "Parchment and lagoon",
    canvas: "#f7ecdb",
    accent: "#8a3a18",
    swatch: ["#f7ecdb", "#8a3a18", "#a9c6bc"],
    tileFilter:
      "sepia(.54) hue-rotate(88deg) saturate(.86) brightness(.84) contrast(1.18)",
    wash: "rgb(66 111 101 / 9%)",
    vector: {
      land: "#f7ecdb",
      landcover: "#f0d9bd",
      parks: "#d8cf94",
      water: "#a9c6bc",
      waterway: "#93b4a8",
      buildings: "#efd9bd",
      aeroway: "#efd9bd",
      roadMajor: "#8a3a18",
      roadMinor: "#b35e30",
      roadPath: "#ddb892",
      roadOutline: "#f8efe0",
      label: "#573323",
      labelHalo: "#f7ecdb",
      boundary: "#b88c70",
    },
  },
  kyoto: {
    id: "kyoto",
    name: "Kyoto",
    description: "Warm paper and charcoal roads",
    canvas: "#f3f0e8",
    accent: "#232520",
    swatch: ["#f3f0e8", "#232520", "#c0cabb"],
    tileFilter:
      "grayscale(.66) sepia(.34) saturate(.62) hue-rotate(35deg) brightness(.8) contrast(1.28)",
    wash: "rgb(91 96 69 / 8%)",
    vector: {
      land: "#f3f0e8",
      landcover: "#e4e2d2",
      parks: "#c9d2af",
      water: "#c0cabb",
      waterway: "#aab6a2",
      buildings: "#e4e0d2",
      aeroway: "#e4e0d2",
      roadMajor: "#232520",
      roadMinor: "#51564a",
      roadPath: "#b7baa8",
      roadOutline: "#efece2",
      label: "#232520",
      labelHalo: "#f3f0e8",
      boundary: "#8e9388",
    },
  },
  marrakesch: {
    id: "marrakesch",
    name: "Marrakesch",
    description: "Sand, ochre and palm",
    canvas: "#f1dcc0",
    accent: "#883517",
    swatch: ["#f1dcc0", "#883517", "#ccb86f"],
    tileFilter:
      "sepia(.82) saturate(1.12) hue-rotate(344deg) brightness(.8) contrast(1.24)",
    wash: "rgb(139 92 38 / 10%)",
    vector: {
      land: "#f1dcc0",
      landcover: "#e7c894",
      parks: "#ccb86f",
      water: "#cbbd92",
      waterway: "#b6a47c",
      buildings: "#e8c79a",
      aeroway: "#e8c79a",
      roadMajor: "#883517",
      roadMinor: "#b15c2e",
      roadPath: "#ddb583",
      roadOutline: "#f5e6cd",
      label: "#592616",
      labelHalo: "#f1dcc0",
      boundary: "#ba875e",
    },
  },
  tokyo: {
    id: "tokyo",
    name: "Tokyo",
    description: "Petrol-black night network",
    canvas: "#0d0f16",
    accent: "#2bf0df",
    swatch: ["#0d0f16", "#2bf0df", "#2bb6c4"],
    tileFilter:
      "grayscale(.84) sepia(.72) hue-rotate(126deg) saturate(2.35) brightness(.28) contrast(1.78)",
    wash: "rgb(0 78 84 / 14%)",
    vector: {
      land: "#0d0f16",
      landcover: "#12141d",
      parks: "#0f2620",
      water: "#102a3a",
      waterway: "#15384a",
      buildings: "#161a26",
      aeroway: "#161a26",
      roadMajor: "#2bf0df",
      roadMinor: "#2bb6c4",
      roadPath: "#214e5c",
      roadOutline: "#060810",
      label: "#f4f1e8",
      labelHalo: "#0d0f16",
      boundary: "#20515a",
    },
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
