import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

import {
  isRoadbookMapMode,
  readRoadbookMapStyle,
  recoverRoadbookTiles,
  ROADBOOK_DEFAULT_STYLE,
  ROADBOOK_MAP_STYLES,
  ROADBOOK_STYLE_STORAGE_KEY,
  writeRoadbookMapStyle,
} from "./roadbook-map-style";
import { roadbookMapModes } from "./roadbook-schema";
import {
  createRoadbookVectorLayerStyles,
  ROADBOOK_VECTOR_TILEJSON_URL,
} from "./roadbook-vector-style";

describe("Roadbook map styles", () => {
  it("defines exactly the nine stable city IDs", () => {
    expect(Object.keys(ROADBOOK_MAP_STYLES)).toEqual([...roadbookMapModes]);
    expect(roadbookMapModes).toHaveLength(9);
    expect(roadbookMapModes.every(isRoadbookMapMode)).toBe(true);
  });

  it("matches the city reference palettes by vector layer", () => {
    expect(ROADBOOK_MAP_STYLES.konstanz.vector.water).toBe("#9eb8c2");
    expect(ROADBOOK_MAP_STYLES.reykjavik.vector.land).toBe("#e4e8e7");
    expect(ROADBOOK_MAP_STYLES.lissabon.vector.roadMajor).toBe("#b53a26");
    expect(ROADBOOK_MAP_STYLES.wien.vector.roadMajor).toBe("#70333d");
    expect(ROADBOOK_MAP_STYLES.zurich.vector.land).toBe("#f4f6f8");
    expect(ROADBOOK_MAP_STYLES.venedig.vector.water).toBe("#a9c6bc");
    expect(ROADBOOK_MAP_STYLES.kyoto.vector.roadMajor).toBe("#232520");
    expect(ROADBOOK_MAP_STYLES.marrakesch.vector.landcover).toBe("#e7c894");
    expect(ROADBOOK_MAP_STYLES.tokyo.vector.roadMajor).toBe("#1f6665");
  });

  it("uses real OpenFreeMap vector tiles and styles their source layers", () => {
    expect(ROADBOOK_VECTOR_TILEJSON_URL).toBe(
      "https://tiles.openfreemap.org/planet",
    );
    const styles = createRoadbookVectorLayerStyles(
      ROADBOOK_MAP_STYLES.konstanz.vector,
      ["transportation", "water", "landcover", "place"],
    );
    expect(styles.transportation).toBeTypeOf("function");
    expect(styles.water).toMatchObject({ fill: true, fillOpacity: 1 });
    expect(styles.landcover).toMatchObject({ fill: true });
    expect(styles.place).toEqual([]);
  });

  it("does not color-filter raster tiles to masquerade as vector styles", () => {
    const css = readFileSync("src/app/roadbook/roadbook.css", "utf8");
    const styles = readFileSync(
      "src/features/roadbook/roadbook-map-style.ts",
      "utf8",
    );
    expect(css).not.toContain("roadbook-map-filter");
    expect(css).not.toContain("roadbook-map-wash");
    expect(styles).not.toContain("tileFilter");
    expect(styles).not.toContain("wash:");
  });

  it("keeps zoom controls clear of the bottom Roadbook overlays", () => {
    const css = readFileSync("src/app/roadbook/roadbook.css", "utf8");
    expect(css).toContain(".roadbook-leaflet-map .leaflet-bottom.leaflet-left");
    expect(css).toContain("top: 50%");
    expect(css).toContain("right: max(0.75rem, env(safe-area-inset-right))");
    expect(css).toContain("z-index: 1000");
  });

  it("keeps map zoom enabled without requiring WebGL", () => {
    const map = readFileSync(
      "src/components/roadbook/roadbook-map.tsx",
      "utf8",
    );
    expect(map).toContain("scrollWheelZoom: true");
    expect(map).toContain("doubleClickZoom: true");
    expect(map).toContain("L.vectorGrid.protobuf");
    expect(map.toLowerCase()).not.toContain("webgl");
    expect(map.toLowerCase()).not.toContain("maplibre");
  });

  it("persists valid styles and safely recovers invalid or blocked storage", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    writeRoadbookMapStyle("kyoto", storage);
    expect(values.get(ROADBOOK_STYLE_STORAGE_KEY)).toBe("kyoto");
    expect(readRoadbookMapStyle(storage)).toBe("kyoto");
    values.set(ROADBOOK_STYLE_STORAGE_KEY, "unknown");
    expect(readRoadbookMapStyle(storage)).toBe(ROADBOOK_DEFAULT_STYLE);
    expect(
      readRoadbookMapStyle({
        getItem: () => {
          throw new Error("blocked");
        },
      }),
    ).toBe(ROADBOOK_DEFAULT_STYLE);
  });

  it("tries the universal raster fallback before exposing an error", () => {
    let state = { failures: 0, fallbackAttempted: false };
    for (let failure = 0; failure < 3; failure += 1) {
      const result = recoverRoadbookTiles(state, false);
      state = result.state;
      expect(result.action).toBe("wait");
    }
    const fallback = recoverRoadbookTiles(state, false);
    expect(fallback.action).toBe("fallback");
    state = fallback.state;
    for (let failure = 0; failure < 3; failure += 1)
      state = recoverRoadbookTiles(state, false).state;
    expect(recoverRoadbookTiles(state, false).action).toBe("error");
  });

  it("changes visuals without remounting the map or resetting Roadbook state", () => {
    const experience = readFileSync(
      "src/components/roadbook/roadbook-experience.tsx",
      "utf8",
    );
    expect(experience).toContain("onChange={updateMode}");
    expect(experience).not.toMatch(/<RoadbookMap\s+key=/);
    expect(experience).not.toContain("setCenter(defaultCenter)");
    expect(experience).not.toContain("setCategories([])");
    expect(experience).not.toContain(
      "setSelectedVenue(undefined);\n    setMode",
    );
  });

  it("contains no legacy proprietary-map runtime references", () => {
    const forbidden = ["map", "box"].join("");
    const files = execFileSync(
      "git",
      ["ls-files", "-co", "--exclude-standard"],
      { encoding: "utf8" },
    )
      .trim()
      .split("\n");
    const offenders = files.filter((file) => {
      if (
        !file ||
        file === "pnpm-lock.yaml" ||
        file === "src/features/roadbook/roadbook-map-style.test.ts"
      )
        return false;
      try {
        return readFileSync(file, "utf8").toLowerCase().includes(forbidden);
      } catch {
        return false;
      }
    });
    expect(offenders).toEqual([]);
  });
});
