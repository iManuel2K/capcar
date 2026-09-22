import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { evaluateRoadbookReadiness } from "@/features/roadbook/roadbook-readiness";
import {
  roadbookEventListSchema,
  roadbookVenueListSchema,
  type RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";
import { ROADBOOK_DATA_TIMEOUT_MS } from "@/features/roadbook/roadbook-timeout";

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

const event = roadbookEventListSchema.parse([
  {
    id: "f5b1bd86-9fc3-475b-bca8-a2fc49f3b298",
    venue_id: venue.id,
    title: "Track evening",
    slug: "track-evening",
    description: "A sourced driving event.",
    event_type: "driver_training",
    participation: "driver",
    booking_required: true,
    starts_at: "2026-10-01T16:00:00.000Z",
    ends_at: "2026-10-01T20:00:00.000Z",
    booking_url: "https://example.com/book",
    entry_price_cents: 9900,
    price_currency: "EUR",
    source_label: "Venue calendar",
    source_url: "https://example.com/calendar",
    verification_status: "official_source",
    verified_at: "2026-09-16T12:00:00.000Z",
  },
])[0];

describe("Roadbook contracts", () => {
  it("normalizes PostGIS RPC rows for the client", () => {
    expect(venue.accessStatus).toBe("closed_venue");
    expect(venue.distanceM).toBe(1250);
  });

  it("normalizes sourced venue events", () => {
    expect(event.venueId).toBe(venue.id);
    expect(event.participation).toBe("driver");
    expect(event.bookingRequired).toBe(true);
  });

  it("keeps unknown vehicle noise as an explicit check", () => {
    expect(evaluateRoadbookReadiness(undefined, venue)).toEqual(
      expect.arrayContaining([
        { key: "identity", state: "check" },
        { key: "noise", state: "check" },
      ]),
    );
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

  it("uses a non-WebGL OpenStreetMap layer without a paid token", () => {
    const map = readFileSync(
      "src/components/roadbook/roadbook-map.tsx",
      "utf8",
    );
    expect(map).toContain('from "leaflet"');
    expect(map).toContain("tile.openstreetmap.org");
    expect(map).toContain("OpenStreetMap");
  });

  it("bounds stalled location-data requests", () => {
    expect(ROADBOOK_DATA_TIMEOUT_MS).toBe(12_000);
    const experience = readFileSync(
      "src/components/roadbook/roadbook-experience.tsx",
      "utf8",
    );
    expect(experience).toContain("controller.abort()");
    expect(experience).toContain('t(timedOut ? "errors.slow" : "errors.load")');
  });

  it("publishes only active sourced events", () => {
    const migration = readFileSync(
      "supabase/migrations/20260916120000_roadbook_events_expansion.sql",
      "utf8",
    );
    expect(migration).toContain("ends_at >= now()");
    expect(migration).toContain("DEKRA Lausitzring event calendar");
    expect(migration).toContain("Motorsport Arena official calendar");
  });
});
