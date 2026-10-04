import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createRoutedMapLinks,
  createTripRoute,
} from "@/features/trips/trip-route";

describe("calculated trip routes", () => {
  afterEach(() => vi.restoreAllMocks());

  it("places the returned road geometry and useful stop imagery on the route", async () => {
    const geocodes = [
      [8.4116, 49.9948],
      [8.2709, 50.0037],
      [8.2866, 50.0177],
    ];
    let geocodeIndex = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = input.toString();
      if (url.startsWith("https://api.geoapify.com/")) {
        const coordinates = geocodes[geocodeIndex++];
        return Response.json({
          features: [
            {
              geometry: { coordinates },
              properties: { lon: coordinates[0], lat: coordinates[1] },
            },
          ],
        });
      }
      if (url.startsWith("https://router.project-osrm.org/")) {
        return Response.json({
          code: "Ok",
          routes: [
            {
              distance: 18_500,
              duration: 1_620,
              geometry: {
                coordinates: [geocodes[0], geocodes[1], geocodes[2]],
              },
            },
          ],
        });
      }
      if (url.startsWith("https://api.unsplash.com/")) {
        return Response.json({
          results: [
            {
              alt_description: "A useful view of the planned stop",
              urls: {
                regular: "https://images.unsplash.com/photo-route",
              },
              links: { html: "https://unsplash.com/photos/route" },
              user: { name: "Route Photographer" },
            },
          ],
        });
      }
      if (url.startsWith("https://api.open-meteo.com/")) {
        return Response.json({
          daily: {
            time: ["2026-10-10"],
            weather_code: [2],
            temperature_2m_max: [17],
            temperature_2m_min: [8],
            precipitation_probability_max: [20],
          },
        });
      }
      throw new Error(`Unexpected URL ${url}`);
    });

    const route = await createTripRoute(
      {
        region: "Mainz and Rheingau",
        startDate: "2026-10-10",
        stops: [
          {
            day: 1,
            kind: "scenic_road",
            name: "Rüsselsheim",
            area: "Rüsselsheim",
            mapQuery: "Rüsselsheim Marktplatz",
          },
          {
            day: 1,
            kind: "culture",
            name: "Gutenberg Museum",
            area: "Mainz",
            mapQuery: "Gutenberg Museum Mainz",
          },
          {
            day: 1,
            kind: "fuel",
            name: "Mainz-Kastel fuel",
            area: "Mainz-Kastel",
            mapQuery: "fuel station Mainz-Kastel",
          },
        ],
      },
      {
        GEOAPIFY_API_KEY: "geo-key",
        UNSPLASH_ACCESS_KEY: "photo-key",
      },
    );

    expect(route.provider).toContain("OSRM");
    expect(route.distanceKm).toBe(18.5);
    expect(route.durationMinutes).toBe(27);
    expect(route.geometry.coordinates).toHaveLength(3);
    expect(route.stops[0].photo?.photographer).toBe("Route Photographer");
    expect(route.stops.every((stop) => stop.locationAccuracy === "place")).toBe(
      true,
    );
    expect(route.weather).toMatchObject({
      temperatureMinC: 8,
      temperatureMaxC: 17,
      precipitationProbability: 20,
    });
  });

  it("creates coordinate-based directions for every mapped stop", () => {
    const links = createRoutedMapLinks([
      { latitude: 42.6629, longitude: 21.1655 },
      { latitude: 42.6592, longitude: 20.2883 },
      { latitude: 42.676, longitude: 20.167 },
      { latitude: 42.661, longitude: 20.157 },
    ]);

    const google = new URL(links.google);
    expect(google.searchParams.get("origin")).toBe("42.662900,21.165500");
    expect(google.searchParams.get("waypoints")?.split("|")).toHaveLength(2);
    expect(google.searchParams.get("destination")).toBe("42.661000,20.157000");

    const openStreetMap = new URL(links.openStreetMap);
    expect(openStreetMap.pathname).toBe("/directions");
    expect(openStreetMap.searchParams.get("engine")).toBe("fossgis_osrm_car");
    expect(openStreetMap.searchParams.get("route")).toBe(
      "42.662900,21.165500;42.661000,20.157000",
    );
  });
});
