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

describe("OpenRouteService GeoJSON routing", () => {
  afterEach(() => vi.restoreAllMocks());
  it.each([false, true])(
    "returns road geometry when primary failure is %s",
    async (primaryFails) => {
      let index = 0;
      const points = [
        [8.41, 49.99],
        [8.27, 50.0],
      ];
      const fallback = vi.fn();
      vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
        const url = input.toString();
        if (url.startsWith("https://api.geoapify.com/")) {
          return Response.json({
            features: [{ geometry: { coordinates: points[index++] } }],
          });
        }
        if (url.startsWith("https://api.openrouteservice.org/")) {
          expect(new Headers(init?.headers).get("accept")).toBe(
            "application/geo+json",
          );
          if (primaryFails) return new Response(null, { status: 406 });
          return Response.json({
            features: [
              {
                geometry: { coordinates: points },
                properties: { summary: { distance: 18000, duration: 1600 } },
              },
            ],
          });
        }
        if (url.startsWith("https://router.project-osrm.org/")) {
          fallback();
          expect(url).toContain("8.41,49.99;8.27,50");
          return Response.json({
            code: "Ok",
            routes: [
              {
                distance: 18000,
                duration: 1600,
                geometry: { coordinates: points },
              },
            ],
          });
        }
        throw new Error("Optional enrichment unavailable");
      });
      const route = await createTripRoute(
        {
          region: "Mainz",
          startDate: "2026-10-20",
          stops: [
            {
              day: 1,
              kind: "culture",
              name: "Rüsselsheim",
              mapQuery: "Rüsselsheim",
            },
            { day: 1, kind: "culture", name: "Mainz", mapQuery: "Mainz" },
          ],
        },
        {
          GEOAPIFY_API_KEY: "geo-test",
          OPENROUTESERVICE_API_KEY: "route-test",
        },
      );
      expect(route.geometry.coordinates).toEqual(points);
      expect(route.provider).toContain(
        primaryFails ? "OSRM" : "OpenRouteService",
      );
      expect(fallback).toHaveBeenCalledTimes(primaryFails ? 1 : 0);
    },
  );
});

describe("automatic road-time matrix integration", () => {
  afterEach(() => vi.restoreAllMocks());
  it.each([false, true])("orders automatic suggestions but preserves explicit order: %s", async (preserveStopOrder) => {
    const positions = [0, 2, 1, 3, 4];
    const points = positions.map(position => [8 + position / 10, 50]);
    const matrix = positions.map(a => positions.map(b => Math.abs(a - b) * 100));
    let geocodeIndex = 0;
    let matrixCalls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async input => {
      const url = input.toString();
      if (url.startsWith("https://api.geoapify.com/")) return Response.json({ features: [{ geometry: { coordinates: points[geocodeIndex++] } }] });
      if (url.includes("/table/v1/driving/")) { matrixCalls += 1; return Response.json({ code: "Ok", durations: matrix }); }
      if (url.includes("/route/v1/driving/")) {
        const coordinates = new URL(url).pathname.split("/driving/")[1].split(";").map(pair => pair.split(",").map(Number));
        return Response.json({ code: "Ok", routes: [{ distance: 10000, duration: 1000, geometry: { coordinates } }] });
      }
      throw new Error("Optional enrichment unavailable");
    });
    const route = await createTripRoute({
      region: "Black Forest", preserveStopOrder,
      stops: positions.map((_, index) => ({ day: 1, kind: "photo" as const, name: "Stop " + index, mapQuery: index === 4 ? "Place 0" : "Place " + index })),
    }, { GEOAPIFY_API_KEY: "test-key" });
    expect(route.stops.map(stop => stop.sourceIndex)).toEqual(preserveStopOrder ? [0, 1, 2, 3, 4] : [0, 2, 1, 3, 4]);
    expect(route.geometry.coordinates).toEqual(route.stops.map(stop => [stop.longitude, stop.latitude]));
    expect(route.ordering?.status).toBe(preserveStopOrder ? "preserved" : "optimized");
    expect(matrixCalls).toBe(preserveStopOrder ? 0 : 1);
    expect(route.stops).toHaveLength(5);
  });
});
