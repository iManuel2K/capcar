import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { roadbookVenueListSchema } from "./roadbook-schema";

const venues = JSON.parse(
  readFileSync("data/roadbook/worldwide-2026-11-02.json", "utf8"),
);
const selection = JSON.parse(
  readFileSync("scripts/roadbook-worldwide-selection.json", "utf8"),
);

describe("reviewed worldwide Roadbook batch", () => {
  it("adds at least 100 named venues across all six populated continents", () => {
    expect(venues.length).toBeGreaterThanOrEqual(100);
    expect(
      new Set(venues.map((venue: { wikidataId: string }) => venue.wikidataId))
        .size,
    ).toBe(venues.length);
    expect(
      new Set(
        venues.map((venue: { country_code: string }) => venue.country_code),
      ).size,
    ).toBeGreaterThanOrEqual(30);
    expect(
      new Set(
        venues.map(
          (venue: { requirements: { catalogImport: { region: string } } }) =>
            venue.requirements.catalogImport.region,
        ),
      ),
    ).toEqual(
      new Set([
        "Africa",
        "Asia",
        "Europe",
        "Middle East",
        "North America",
        "South America",
        "Oceania",
      ]),
    );
  });
  it("parses every entry with the real map schema and leaves unknown facts unclaimed", () => {
    const rows = venues.map((venue: Record<string, unknown>) => ({
      ...venue,
      id: "2179f011-001b-48d6-9f29-f8d040906d85",
      route_geojson: null,
      surface: null,
      length_m: null,
      noise_limit_db: null,
      opening_hours: {},
      booking_url: null,
      entry_price_cents: null,
      price_currency: "EUR",
      distance_m: 0,
    }));
    const parsed = roadbookVenueListSchema.parse(rows);
    expect(parsed).toHaveLength(venues.length);
    for (const venue of parsed) {
      expect(venue.verificationStatus).toBe("official_source");
      expect(venue.verifiedAt).toBeUndefined();
      expect(venue.routeGeoJson).toBeUndefined();
      expect(venue.entryPriceCents).toBeUndefined();
      expect(venue.sourceUrl).toMatch(/^https:\/\//);
      expect(venue.description).toContain("not confirmed");
    }
  });
  it("retains coordinate provenance and excludes reviewed closures and bad domains", () => {
    for (const venue of venues) {
      expect(selection.excludedExamples[venue.wikidataId]).toBeUndefined();
      expect(venue.name).not.toMatch(/^Q\d+$/);
      expect(venue.slug).toMatch(/^world-q\d+$/);
      expect(venue.requirements.catalogImport.coordinateSource).toBe(
        `https://www.wikidata.org/wiki/${venue.wikidataId}`,
      );
      expect(venue.requirements.catalogImport.coordinateLicense).toBe(
        "CC0-1.0",
      );
      expect(venue.source_url).not.toMatch(
        /batangasracingcircuit|vorstehhund|pittrace|intercityfilo/,
      );
    }
  });
  it("places representative venues in the correct geographic hemisphere", () => {
    const byId = new Map(
      venues.map((venue: { wikidataId: string }) => [venue.wikidataId, venue]),
    );
    for (const id of ["Q173766", "Q16777468", "Q1278165", "Q2333555"]) {
      const venue = byId.get(id) as { latitude: number; longitude: number };
      expect(venue.latitude).toBeLessThan(0);
      expect(venue.longitude).toBeGreaterThan(0);
    }
    const cota = byId.get("Q59626") as { latitude: number; longitude: number };
    expect(cota.latitude).toBeGreaterThan(25);
    expect(cota.longitude).toBeLessThan(-90);
  });
});
