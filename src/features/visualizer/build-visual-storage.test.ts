import { describe, expect, it } from "vitest";

import {
  readBuildVisuals,
  saveBuildVisual,
} from "@/features/visualizer/build-visual-storage";
import {
  buildVisualSchema,
  createDefaultBuildVisual,
  studioModelIds,
} from "@/features/visualizer/build-visual-schema";

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

  it("persists an explicit free model reference with the existing build configuration", () => {
    const storage = window.localStorage;
    storage.clear();
    const initial = createDefaultBuildVisual("vehicle-1", "build-1");
    saveBuildVisual(
      { ...initial, studioModelId: "nissan-gt-r", paint: "estoril-blue" },
      storage,
    );
    expect(readBuildVisuals(storage)[0]).toMatchObject({
      studioModelId: "nissan-gt-r",
      paint: "estoril-blue",
    });
    saveBuildVisual(
      { ...readBuildVisuals(storage)[0], studioModelId: undefined },
      storage,
    );
    expect(readBuildVisuals(storage)[0].studioModelId).toBeUndefined();
  });

  it("accepts every library ID and rejects arbitrary paths or remote models", () => {
    const initial = createDefaultBuildVisual("vehicle-1", "build-1");
    expect(studioModelIds).toHaveLength(25);
    for (const studioModelId of studioModelIds) {
      expect(
        buildVisualSchema.safeParse({ ...initial, studioModelId }).success,
      ).toBe(true);
    }
    for (const studioModelId of [
      "../private",
      "https://example.com/model.glb",
      "bmw-m3-e46",
    ]) {
      expect(
        buildVisualSchema.safeParse({ ...initial, studioModelId }).success,
      ).toBe(false);
    }
    expect(buildVisualSchema.safeParse(initial).success).toBe(true);
  });
});
