import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "../../../messages/roadbook/en.json";
import de from "../../../messages/roadbook/de.json";
import el from "../../../messages/roadbook/el.json";
import sq from "../../../messages/roadbook/sq.json";
import ja from "../../../messages/roadbook/ja.json";
import { RoadbookDiscoveryRail } from "./roadbook-discovery-rail";
import { roadbookVenueListSchema } from "@/features/roadbook/roadbook-schema";

vi.unmock("next-intl");

afterEach(cleanup);
const props = {
  venues: [],
  events: [],
  onOpenChange: vi.fn(),
  onSelectVenue: vi.fn(),
};

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
      <NextIntlClientProvider locale="en" messages={en}>
        <RoadbookDiscoveryRail {...props} venues={[venue]} open="places" />
      </NextIntlClientProvider>,
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

describe("Roadbook place counts", () => {
  it("distinguishes the whole catalog from the filtered area", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <RoadbookDiscoveryRail {...props} catalogCount={125} />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("125 places in the catalog")).toBeVisible();
    expect(screen.getByText("0 places in this area")).toBeVisible();
  });
  it("does not imply zero places while the area is loading or unavailable", () => {
    const { rerender } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <RoadbookDiscoveryRail {...props} loading />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Checking the visible area…")).toBeVisible();
    expect(screen.queryByText("0 places in this area")).toBeNull();
    rerender(
      <NextIntlClientProvider locale="en" messages={en}>
        <RoadbookDiscoveryRail {...props} loadError />
      </NextIntlClientProvider>,
    );
    expect(
      screen.getByText("Roadbook places could not be loaded."),
    ).toBeVisible();
    expect(screen.queryByText("0 places in this area")).toBeNull();
  });
  it.each(Object.entries({ en, de, el, sq, ja }))(
    "renders catalog copy in %s",
    (locale, messages) => {
      const { container } = render(
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RoadbookDiscoveryRail {...props} catalogCount={125} />
        </NextIntlClientProvider>,
      );
      expect(
        container.querySelector("[data-roadbook-place-count]"),
      ).toHaveTextContent("125");
      expect(container.textContent).not.toContain(
        "Roadbook.places.catalogTotal",
      );
    },
  );
});
