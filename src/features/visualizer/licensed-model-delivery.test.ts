import { describe, expect, it } from "vitest";

import { vehicleModelSchema } from "./vehicle-model-schema";

describe("licensed model delivery", () => {
  const base = {
    provider: "Licensed partner",
    source: "external",
    accuracy: "dimensionally-verified",
    assetId: "bmw-e90-2011",
    vehicleKey: "BMW:E90:2011",
    revision: "1",
    coordinateUnit: "mm",
    dimensions: {
      length: 4531,
      width: 1817,
      height: 1421,
      wheelbase: 2760,
      trackFront: 1500,
      trackRear: 1513,
      referenceWheelDiameter: 650,
    },
    mappedSlots: ["paint", "stance"],
    warnings: [],
  };

  it("allows an integrity-checked GLB only with commercial-use rights", () => {
    const result = vehicleModelSchema.parse({
      ...base,
      license: { commercialUse: true, name: "Commercial model licence" },
      delivery: {
        format: "glb",
        url: "https://assets.example/bmw-e90.glb",
        sha256: "a".repeat(64),
        byteLength: 2_000_000,
      },
    });
    expect(result.vertices).toEqual([]);
    expect(result.delivery?.format).toBe("glb");
  });

  it("rejects an unlicensed delivery", () => {
    expect(
      vehicleModelSchema.safeParse({
        ...base,
        license: { commercialUse: false },
        delivery: {
          format: "glb",
          url: "/models/unlicensed.glb",
          sha256: "b".repeat(64),
          byteLength: 100,
        },
      }).success,
    ).toBe(false);
  });
});
