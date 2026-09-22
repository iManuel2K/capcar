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

describe("Roadbook map styles", () => {
  it("defines exactly the nine stable city IDs", () => {
    expect(Object.keys(ROADBOOK_MAP_STYLES)).toEqual([...roadbookMapModes]);
    expect(roadbookMapModes).toHaveLength(9);
    expect(roadbookMapModes.every(isRoadbookMapMode)).toBe(true);
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

  it("contains no legacy proprietary-map references in tracked files", () => {
    const forbidden = ["map", "box"].join("");
    const files = execFileSync(
      "git",
      ["ls-files", "-co", "--exclude-standard"],
      { encoding: "utf8" },
    )
      .trim()
      .split("\n");
    const offenders = files.filter((file) => {
      if (!file || file === "src/features/roadbook/roadbook-map-style.test.ts")
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
