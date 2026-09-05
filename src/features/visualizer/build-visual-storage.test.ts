import { describe, expect, it } from "vitest";

import {
  readBuildVisuals,
  saveBuildVisual,
} from "@/features/visualizer/build-visual-storage";
import { createDefaultBuildVisual } from "@/features/visualizer/build-visual-schema";

describe("build visual storage", () => {
  it("replaces one build concept without duplicating it", () => {
    const storage = window.localStorage;
    storage.clear();
    const initial = createDefaultBuildVisual("vehicle-1", "build-1");
    saveBuildVisual(initial, storage, "2026-09-05T10:00:00.000Z");
    saveBuildVisual(
      { ...initial, paint: "deep-green", stance: "sport" },
      storage,
      "2026-09-05T11:00:00.000Z",
    );
    const visuals = readBuildVisuals(storage);
    expect(visuals).toHaveLength(1);
    expect(visuals[0].paint).toBe("deep-green");
    expect(visuals[0].stance).toBe("sport");
  });
});
