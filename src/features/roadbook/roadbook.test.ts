import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { createRoadbookMapStyle } from "@/features/roadbook/roadbook-map-style";
import { evaluateRoadbookReadiness } from "@/features/roadbook/roadbook-readiness";
import {
  roadbookMapModes,
  roadbookVenueListSchema,
  type RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";

const venue = roadbookVenueListSchema.parse([
  {
    id: "a6d23c12-4ca1-4cc5-ac1d-c65341337c7d",
    name: "Closed test venue",
    slug: "closed-test-venue",
    category: "drag_acceleration",
    description: "A controlled venue record.",
    access_status: "closed_venue",
    latitude: 50.1,
    longitude: 8.6,
    route_geojson: null,
    country_code: "DE",
    city: "Frankfurt",
    surface: "Asphalt",
    length_m: 1200,
    noise_limit_db: 98,
    opening_hours: {},
    booking_url: null,
    entry_price_cents: null,
    price_currency: "EUR",
    requirements: { requiresRoadLegal: false },
    source_label: "Venue source",
    source_url: "https://example.com/venue",
    verification_status: "verified",
    verified_at: "2026-09-15T12:00:00.000Z",
    distance_m: 1250,
  },
])[0] as RoadbookVenue;

describe("Roadbook contracts", () => {
  it("normalizes PostGIS RPC rows for the client", () => {
    expect(venue.accessStatus).toBe("closed_venue");
    expect(venue.distanceM).toBe(1250);
  });

  it("keeps unknown vehicle noise as an explicit check", () => {
    expect(evaluateRoadbookReadiness(undefined, venue)).toEqual(
      expect.arrayContaining([
        { key: "identity", state: "check" },
        { key: "noise", state: "check" },
      ]),
    );
  });

  it("builds a distinct Mapbox style for every Capcar mode", () => {
    const colors = roadbookMapModes.map((mode) => {
      const style = createRoadbookMapStyle(mode);
      const background = style.layers.find(
        (layer) => layer.id === "background",
      );
      return background && "paint" in background
        ? (background.paint as Record<string, unknown>)?.["background-color"]
        : undefined;
    });
    expect(new Set(colors).size).toBe(4);
  });

  it("enforces closed venues for drift and timed acceleration in SQL", () => {
    const migration = readFileSync(
      "supabase/migrations/20260915190000_roadbook.sql",
      "utf8",
    );
    expect(migration).toContain(
      "category not in ('drift_circuit', 'drag_acceleration')",
    );
    expect(migration).toContain(
      "category <> 'autobahn_context' or access_status = 'public_context'",
    );
  });

  it("uses Mapbox's strict-CSP worker without unsafe-eval", () => {
    const map = readFileSync(
      "src/components/roadbook/roadbook-map.tsx",
      "utf8",
    );
    expect(map).toContain('mapbox-gl/dist/mapbox-gl-csp.js');
    expect(map).toContain('mapboxgl.workerUrl = "/mapbox-gl-csp-worker.js"');
    expect(existsSync("public/mapbox-gl-csp-worker.js")).toBe(true);
  });
});
