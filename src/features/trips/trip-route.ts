import { z } from "zod";

import { tripStopKinds } from "@/features/trips/trip-planner";

export const tripRouteRequestSchema = z.object({
  region: z.string().trim().min(2).max(120),
  startDate: z.iso.date().optional(),
  stops: z
    .array(
      z.object({
        day: z.number().int().min(1).max(5),
        kind: z.enum(tripStopKinds),
        name: z.string().trim().min(1).max(120),
        area: z.string().trim().min(1).max(120).optional(),
        mapQuery: z.string().trim().min(2).max(180),
      }),
    )
    .min(2)
    .max(18),
});

const routePhotoSchema = z.object({
  url: z.url().startsWith("https://images.unsplash.com/"),
  alt: z.string().min(1).max(300),
  photographer: z.string().min(1).max(120),
  sourceUrl: z.url().startsWith("https://unsplash.com/"),
  context: z.literal("representative"),
});

const routedStopSchema = tripRouteRequestSchema.shape.stops.element.extend({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationAccuracy: z.enum(["place", "area"]),
  resolvedQuery: z.string().min(1).max(300),
  photo: routePhotoSchema.optional(),
});

export const tripRouteSchema = z.object({
  provider: z.string().min(1),
  geometry: z.object({
    type: z.literal("LineString"),
    coordinates: z.array(z.tuple([z.number(), z.number()])).min(2),
  }),
  distanceKm: z.number().positive(),
  durationMinutes: z.number().positive(),
  stops: z.array(routedStopSchema).min(2).max(10),
  bounds: z.tuple([
    z.tuple([z.number(), z.number()]),
    z.tuple([z.number(), z.number()]),
  ]),
  weather: z
    .object({
      date: z.iso.date(),
      temperatureMinC: z.number(),
      temperatureMaxC: z.number(),
      precipitationProbability: z.number().min(0).max(100),
      summary: z.string().min(1),
      sourceUrl: z.url().startsWith("https://open-meteo.com/"),
    })
    .optional(),
});

export type TripRouteRequest = z.infer<typeof tripRouteRequestSchema>;
export type TripRoute = z.infer<typeof tripRouteSchema>;
export type TripRouteMapLinks = {
  google: string;
  apple: string;
  waze: string;
  openStreetMap: string;
};

type RouteEnvironment = Record<string, string | undefined>;

type GeocodedPoint = { latitude: number; longitude: number };

export function createRoutedMapLinks(
  stops: Array<Pick<TripRoute["stops"][number], "latitude" | "longitude">>,
): TripRouteMapLinks {
  const points = stops.map(
    (stop) => `${stop.latitude.toFixed(6)},${stop.longitude.toFixed(6)}`,
  );
  const origin = points[0];
  const destination = points.at(-1);
  if (!origin || !destination)
    throw new Error("At least two mapped stops are required.");

  const google = new URL("https://www.google.com/maps/dir/");
  google.searchParams.set("api", "1");
  google.searchParams.set("origin", origin);
  google.searchParams.set("destination", destination);
  google.searchParams.set("travelmode", "driving");
  const waypoints = points.slice(1, -1).slice(0, 3);
  if (waypoints.length)
    google.searchParams.set("waypoints", waypoints.join("|"));

  const apple = new URL("https://maps.apple.com/");
  apple.searchParams.set("saddr", origin);
  apple.searchParams.set("daddr", destination);
  apple.searchParams.set("dirflg", "d");

  const waze = new URL("https://www.waze.com/ul");
  waze.searchParams.set("ll", destination);
  waze.searchParams.set("navigate", "yes");

  const openStreetMap = new URL("https://www.openstreetmap.org/directions");
  openStreetMap.searchParams.set("engine", "fossgis_osrm_car");
  openStreetMap.searchParams.set("route", `${origin};${destination}`);

  return {
    google: google.toString(),
    apple: apple.toString(),
    waze: waze.toString(),
    openStreetMap: openStreetMap.toString(),
  };
}

function selectRouteStops(stops: TripRouteRequest["stops"]) {
  const unique = stops.filter(
    (stop, index, values) =>
      values.findIndex(
        (candidate) =>
          candidate.mapQuery.toLocaleLowerCase() ===
          stop.mapQuery.toLocaleLowerCase(),
      ) === index,
  );
  if (unique.length <= 8) return unique;
  const selected = [unique[0]];
  for (let index = 1; index < 7; index += 1) {
    selected.push(unique[Math.round((index * (unique.length - 1)) / 7)]);
  }
  selected.push(unique.at(-1)!);
  return selected.filter(
    (stop, index, values) =>
      values.findIndex((candidate) => candidate.mapQuery === stop.mapQuery) ===
      index,
  );
}

async function fetchJson(input: string | URL, init: RequestInit = {}) {
  const response = await fetch(input, {
    ...init,
    headers: {
      accept: "application/json",
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok)
    throw new Error(`Route provider returned ${response.status}.`);
  return response.json() as Promise<unknown>;
}

async function geocodeWithGeoapify(
  query: string,
  apiKey: string,
): Promise<GeocodedPoint> {
  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("format", "geojson");
  url.searchParams.set("apiKey", apiKey);
  const body = (await fetchJson(url)) as {
    features?: Array<{
      properties?: { lat?: number; lon?: number };
      geometry?: { coordinates?: [number, number] };
    }>;
  };
  const feature = body.features?.[0];
  const latitude =
    feature?.properties?.lat ?? feature?.geometry?.coordinates?.[1];
  const longitude =
    feature?.properties?.lon ?? feature?.geometry?.coordinates?.[0];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
    throw new Error(`Could not locate ${query}.`);
  return { latitude: latitude!, longitude: longitude! };
}

async function geocodeWithNominatim(query: string): Promise<GeocodedPoint> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  const body = (await fetchJson(url, {
    headers: {
      "user-agent": "CapCar trip planner/1.0 (+https://capcar.dev/ai)",
    },
  })) as Array<{ lat?: string; lon?: string }>;
  const latitude = Number(body[0]?.lat);
  const longitude = Number(body[0]?.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
    throw new Error(`Could not locate ${query}.`);
  return { latitude, longitude };
}

async function geocodeStops(
  request: TripRouteRequest,
  environment: RouteEnvironment,
) {
  const stops = selectRouteStops(request.stops);
  const geocode = environment.GEOAPIFY_API_KEY
    ? (query: string) =>
        geocodeWithGeoapify(query, environment.GEOAPIFY_API_KEY!)
    : geocodeWithNominatim;
  const routed = [];
  for (const stop of stops) {
    const detailedQueries = [
      stop.mapQuery,
      stop.area ? `${stop.mapQuery}, ${stop.area}` : undefined,
      `${stop.mapQuery}, ${request.region}`,
      stop.name,
      stop.area ? `${stop.name}, ${stop.area}` : undefined,
    ];
    const areaQueries = [
      stop.area,
      stop.area ? `${stop.area}, ${request.region}` : undefined,
    ];
    const candidates = [...detailedQueries, ...areaQueries].filter(
      (query, index, values): query is string =>
        Boolean(query) &&
        values.findIndex(
          (value) => value?.toLocaleLowerCase() === query?.toLocaleLowerCase(),
        ) === index,
    );
    for (const query of candidates) {
      try {
        const point = await geocode(query);
        const locationAccuracy = areaQueries.includes(query) ? "area" : "place";
        routed.push({
          ...stop,
          ...point,
          locationAccuracy,
          resolvedQuery: query,
        });
        break;
      } catch {
        // Try the next, less specific location candidate.
      }
    }
  }
  if (routed.length < 2)
    throw new Error("At least two route stops must be locatable.");
  return routed;
}

async function routeWithOpenRouteService(
  stops: Array<GeocodedPoint>,
  apiKey: string,
) {
  const body = (await fetchJson(
    "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
    {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        coordinates: stops.map((stop) => [stop.longitude, stop.latitude]),
        instructions: false,
      }),
    },
  )) as {
    features?: Array<{
      geometry?: { type?: string; coordinates?: Array<[number, number]> };
      properties?: { summary?: { distance?: number; duration?: number } };
    }>;
  };
  const feature = body.features?.[0];
  const coordinates = feature?.geometry?.coordinates;
  const summary = feature?.properties?.summary;
  if (!coordinates?.length || !summary?.distance || !summary.duration)
    throw new Error("OpenRouteService returned no route.");
  return {
    provider: "OpenRouteService · OpenStreetMap",
    coordinates,
    distanceMeters: summary.distance,
    durationSeconds: summary.duration,
  };
}

async function routeWithOsrm(stops: Array<GeocodedPoint>) {
  const coordinates = stops
    .map((stop) => `${stop.longitude},${stop.latitude}`)
    .join(";");
  const url = new URL(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}`,
  );
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "false");
  const body = (await fetchJson(url)) as {
    code?: string;
    routes?: Array<{
      distance?: number;
      duration?: number;
      geometry?: { coordinates?: Array<[number, number]> };
    }>;
  };
  const route = body.routes?.[0];
  if (
    body.code !== "Ok" ||
    !route?.geometry?.coordinates?.length ||
    !route.distance ||
    !route.duration
  )
    throw new Error("OSRM returned no route.");
  return {
    provider: "OSRM · OpenStreetMap",
    coordinates: route.geometry.coordinates,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
}

function unsplashReferral(value: string) {
  const url = new URL(value);
  url.searchParams.set("utm_source", "capcar");
  url.searchParams.set("utm_medium", "referral");
  return url.toString();
}

async function findUsefulStopPhoto(
  stop: TripRouteRequest["stops"][number],
  region: string,
  accessKey: string,
) {
  if (
    !(["photo", "culture", "nature", "scenic_road"] as string[]).includes(
      stop.kind,
    )
  )
    return undefined;
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", `${stop.name} ${region} travel`);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("content_filter", "high");
  url.searchParams.set("per_page", "3");
  const body = (await fetchJson(url, {
    headers: {
      authorization: `Client-ID ${accessKey}`,
      "accept-version": "v1",
    },
  })) as {
    results?: Array<{
      description?: string | null;
      alt_description?: string | null;
      urls?: { regular?: string };
      links?: { html?: string };
      user?: { name?: string };
    }>;
  };
  const photo = body.results?.find(
    (item) => item.urls?.regular && item.links?.html && item.user?.name,
  );
  if (!photo?.urls?.regular || !photo.links?.html || !photo.user?.name)
    return undefined;
  return routePhotoSchema.parse({
    url: photo.urls.regular,
    alt:
      photo.alt_description?.trim() ||
      photo.description?.trim() ||
      `Representative view near ${stop.name}`,
    photographer: photo.user.name,
    sourceUrl: unsplashReferral(photo.links.html),
    context: "representative",
  });
}

function routeBounds(coordinates: Array<[number, number]>) {
  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);
  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)],
  ] as const;
}

function weatherSummary(code: number, precipitation: number) {
  if (code >= 95) return "Thunderstorms may affect the route";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return "Snow or wintry conditions possible";
  if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    precipitation >= 55
  )
    return "Rain likely — allow more time";
  if (code === 45 || code === 48) return "Low visibility possible";
  if (code >= 1) return "Mixed cloud with generally usable conditions";
  return "Mostly clear conditions expected";
}

async function routeWeather(stop: GeocodedPoint, date: string | undefined) {
  if (!date) return undefined;
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(stop.latitude));
  url.searchParams.set("longitude", String(stop.longitude));
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("start_date", date);
  url.searchParams.set("end_date", date);
  const body = (await fetchJson(url)) as {
    daily?: {
      time?: string[];
      weather_code?: number[];
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
      precipitation_probability_max?: number[];
    };
  };
  const daily = body.daily;
  const weatherCode = daily?.weather_code?.[0];
  const min = daily?.temperature_2m_min?.[0];
  const max = daily?.temperature_2m_max?.[0];
  const precipitation = daily?.precipitation_probability_max?.[0];
  if (
    !daily?.time?.[0] ||
    !Number.isFinite(weatherCode) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    !Number.isFinite(precipitation)
  )
    return undefined;
  return {
    date: daily.time[0],
    temperatureMinC: min!,
    temperatureMaxC: max!,
    precipitationProbability: precipitation!,
    summary: weatherSummary(weatherCode!, precipitation!),
    sourceUrl: "https://open-meteo.com/",
  };
}

export async function createTripRoute(
  input: TripRouteRequest,
  environment: RouteEnvironment = process.env,
): Promise<TripRoute> {
  const request = tripRouteRequestSchema.parse(input);
  const stops = await geocodeStops(request, environment);
  const route = environment.OPENROUTESERVICE_API_KEY
    ? await routeWithOpenRouteService(
        stops,
        environment.OPENROUTESERVICE_API_KEY,
      )
    : await routeWithOsrm(stops);
  const photoIndexes = stops
    .map((stop, index) => ({ stop, index }))
    .filter(({ stop }) =>
      (["photo", "culture", "nature", "scenic_road"] as string[]).includes(
        stop.kind,
      ),
    )
    .slice(0, 3);
  const photos = environment.UNSPLASH_ACCESS_KEY
    ? await Promise.all(
        photoIndexes.map(({ stop }) =>
          findUsefulStopPhoto(
            stop,
            request.region,
            environment.UNSPLASH_ACCESS_KEY!,
          ).catch(() => undefined),
        ),
      )
    : [];
  const weather = await routeWeather(
    stops[Math.floor(stops.length / 2)],
    request.startDate,
  ).catch(() => undefined);
  const photoByIndex = new Map(
    photoIndexes.map(({ index }, position) => [index, photos[position]]),
  );
  return tripRouteSchema.parse({
    provider: route.provider,
    geometry: { type: "LineString", coordinates: route.coordinates },
    distanceKm: Number((route.distanceMeters / 1000).toFixed(1)),
    durationMinutes: Math.max(1, Math.round(route.durationSeconds / 60)),
    stops: stops.map((stop, index) => ({
      ...stop,
      photo: photoByIndex.get(index),
    })),
    bounds: routeBounds(route.coordinates),
    weather,
  });
}
