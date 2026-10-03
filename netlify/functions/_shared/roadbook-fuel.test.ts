import { describe, expect, it } from "vitest";

import {
  isTankerkonigCoverage,
  normalizeOverpassResponse,
  normalizeTankerkonigResponse,
  overpassFuelQuery,
  parseRoadbookFuelQuery,
  tankerkoenigUrl,
} from "./roadbook-fuel";

describe("Roadbook fuel provider", () => {
  it("accepts a bounded worldwide nearby search", () => {
    const result = parseRoadbookFuelQuery(
      new URL(
        "https://capcar.dev/api/roadbook/fuel?lat=50.1&lng=8.6&radius=25&type=e10",
      ),
    );
    expect(result.success).toBe(true);
  });

  it("rejects invalid coordinates or excessive searches", () => {
    expect(
      parseRoadbookFuelQuery(
        new URL(
          "https://capcar.dev/api/roadbook/fuel?lat=91&lng=8.6&radius=250&type=all",
        ),
      ).success,
    ).toBe(false);
  });

  it("normalizes stations without exposing the provider response", () => {
    expect(
      normalizeTankerkonigResponse({
        ok: true,
        stations: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            name: "Example Station",
            brand: "Example",
            street: "Mainzer Straße",
            houseNumber: "10",
            postCode: 65428,
            place: "Rüsselsheim",
            lat: 49.99,
            lng: 8.41,
            dist: 2.4,
            e5: 1.819,
            e10: false,
            diesel: 1.699,
            isOpen: true,
          },
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        address: "Mainzer Straße 10, 65428 Rüsselsheim",
        prices: { e5: 1.819, e10: undefined, diesel: 1.699 },
        isOpen: true,
        source: "live_price",
      }),
    ]);
  });

  it("normalizes worldwide OpenStreetMap station discovery without inventing prices", () => {
    expect(
      normalizeOverpassResponse(
        {
          elements: [
            {
              type: "node",
              id: 123,
              lat: 38.72,
              lon: -9.14,
              tags: {
                amenity: "fuel",
                name: "Atlantic Fuel",
                brand: "Atlantic",
                "addr:street": "Rua do Tejo",
                "addr:housenumber": "4",
                "addr:city": "Lisboa",
              },
            },
          ],
        },
        { latitude: 38.71, longitude: -9.13 },
      ),
    ).toEqual([
      expect.objectContaining({
        id: "osm-node-123",
        address: "Rua do Tejo 4, Lisboa",
        prices: {},
        source: "directory",
      }),
    ]);
  });

  it("uses the live-price provider only inside its German coverage", () => {
    expect(isTankerkonigCoverage({ latitude: 50.1, longitude: 8.6 })).toBe(
      true,
    );
    expect(isTankerkonigCoverage({ latitude: 48.86, longitude: 2.35 })).toBe(
      false,
    );
    expect(
      overpassFuelQuery({ latitude: 48.86, longitude: 2.35, radiusKm: 10 }),
    ).toBe(
      '[out:json][timeout:12];node["amenity"="fuel"](around:10000,48.86,2.35);out body 60;',
    );
  });

  it("keeps the API key server-side in the provider URL only", () => {
    const url = tankerkoenigUrl(
      { latitude: 50.1, longitude: 8.6, radiusKm: 10, fuelType: "diesel" },
      "private-key",
    );
    expect(url.searchParams.get("apikey")).toBe("private-key");
    expect(url.searchParams.get("sort")).toBe("price");
  });
});
