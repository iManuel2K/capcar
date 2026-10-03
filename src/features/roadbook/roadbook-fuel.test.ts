import { describe, expect, it } from "vitest";

import { roadbookFuelStationSchema } from "./roadbook-fuel";

describe("Roadbook fuel coverage", () => {
  it("accepts worldwide station-directory results without invented prices", () => {
    expect(
      roadbookFuelStationSchema.parse({
        id: "osm-node-123",
        name: "Atlantic Fuel",
        address: "Lisbon",
        latitude: 38.72,
        longitude: -9.14,
        distanceKm: 1.2,
        prices: {},
        source: "directory",
      }),
    ).toEqual(expect.objectContaining({ source: "directory", prices: {} }));
  });
});
