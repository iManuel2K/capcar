import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RoadbookDiscoveryRail } from "@/components/roadbook/roadbook-discovery-rail";
import { roadbookVenueListSchema } from "@/features/roadbook/roadbook-schema";

const venue = roadbookVenueListSchema.parse([
  {
    id: "2179f011-001b-48d6-9f29-f8d040906d85",
    name: "Alpine photo bend",
    slug: "alpine-photo-bend",
    category: "car_photo_spot",
    description: "A sourced automotive photo location.",
    access_status: "public_context",
    latitude: 46.57,
    longitude: 8.38,
    route_geojson: null,
    country_code: "CH",
    city: "Obergoms",
    surface: "Asphalt",
    length_m: null,
    noise_limit_db: null,
    opening_hours: {},
    booking_url: null,
    entry_price_cents: null,
    price_currency: "EUR",
    requirements: {
      hero_image: {
        url: "https://images.unsplash.com/photo-example",
        alt: "A mountain road",
        photographer: "Example photographer",
        sourceUrl: "https://unsplash.com/photos/example",
        license: "Unsplash License",
        context: "representative",
      },
    },
    source_label: "Official location source",
    source_url: "https://example.com/location",
    verification_status: "official_source",
    verified_at: "2026-09-20T12:00:00.000Z",
    distance_m: 1200,
  },
])[0];

describe("RoadbookDiscoveryRail", () => {
  it("makes sourced place imagery discoverable before opening a marker", () => {
    render(
      <RoadbookDiscoveryRail
        venues={[venue]}
        events={[]}
        open="places"
        onOpenChange={vi.fn()}
        onSelectVenue={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /places · 1/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Places worth the drive" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Alpine photo bend")).toBeInTheDocument();
    expect(screen.getByText("Reference")).toBeInTheDocument();
  });
});
