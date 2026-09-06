import { describe, expect, it } from "vitest";

import {
  defaultInteriorCameraPresets,
  loadInteriorCameraPresets,
  saveInteriorCameraPreset,
} from "./interior-camera-storage";

describe("interior camera storage", () => {
  it("saves valid model-specific camera views and ignores malformed data", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const camera = {
      position: [1, 2, 3] as [number, number, number],
      target: [4, 5, 6] as [number, number, number],
    };

    saveInteriorCameraPreset("e90", "driver", camera, storage);
    expect(loadInteriorCameraPresets("e90", storage).driver).toEqual(camera);
    expect(loadInteriorCameraPresets("another-model", storage)).toEqual({});

    values.set("capcar:interior-cameras:broken", '{"driver":{"position":[]}}');
    expect(loadInteriorCameraPresets("broken", storage)).toEqual({});
  });

  it("provides calibrated E90 camera views before a user saves anything", () => {
    const storage = { getItem: () => null };
    const modelUid = "683639e5ce0c477b882ed6311656d29d";

    expect(loadInteriorCameraPresets(modelUid, storage)).toEqual(
      defaultInteriorCameraPresets[modelUid],
    );
    expect(loadInteriorCameraPresets(modelUid, storage).driver).toBeDefined();
    expect(loadInteriorCameraPresets(modelUid, storage).rear).toBeDefined();
  });
});
