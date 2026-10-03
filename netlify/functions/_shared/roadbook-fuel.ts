import { z } from "zod";

const fuelTypes = ["all", "e5", "e10", "diesel"] as const;

export const roadbookFuelQuerySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusKm: z.number().min(1).max(25),
  fuelType: z.enum(fuelTypes),
});

const providerPriceSchema = z.union([
  z.number().positive(),
  z.literal(false),
  z.null(),
]);

const providerStationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  brand: z.string().nullable().optional(),
  street: z.string().nullable().optional(),
  houseNumber: z.string().nullable().optional(),
  postCode: z.number().int().nullable().optional(),
  place: z.string().nullable().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  dist: z.number().nonnegative(),
  diesel: providerPriceSchema.optional(),
  e5: providerPriceSchema.optional(),
  e10: providerPriceSchema.optional(),
  isOpen: z.boolean().nullable().optional(),
});

const providerResponseSchema = z.object({
  ok: z.boolean(),
  message: z.string().optional(),
  stations: z.array(providerStationSchema).optional(),
});

export type RoadbookFuelType = (typeof fuelTypes)[number];

export type RoadbookFuelStation = {
  id: string;
  name: string;
  brand?: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  isOpen?: boolean;
  prices: { e5?: number; e10?: number; diesel?: number };
  source: "live_price" | "directory";
};

const overpassElementSchema = z.object({
  type: z.enum(["node", "way", "relation"]),
  id: z.number().int(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.record(z.string(), z.string()).optional(),
});

const overpassResponseSchema = z.object({
  elements: z.array(overpassElementSchema),
});

function availablePrice(value: number | false | null | undefined) {
  return typeof value === "number" ? value : undefined;
}

export function parseRoadbookFuelQuery(url: URL) {
  return roadbookFuelQuerySchema.safeParse({
    latitude: Number(url.searchParams.get("lat")),
    longitude: Number(url.searchParams.get("lng")),
    radiusKm: Number(url.searchParams.get("radius") ?? 10),
    fuelType: url.searchParams.get("type") ?? "all",
  });
}

export function normalizeTankerkonigResponse(input: unknown) {
  const parsed = providerResponseSchema.parse(input);
  if (!parsed.ok) throw new Error("TANKERKOENIG_REJECTED");

  return (parsed.stations ?? []).map((station): RoadbookFuelStation => ({
    id: station.id,
    name: station.name.trim(),
    brand: station.brand?.trim() || undefined,
    address: [
      [station.street, station.houseNumber].filter(Boolean).join(" "),
      [station.postCode, station.place].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", "),
    latitude: station.lat,
    longitude: station.lng,
    distanceKm: station.dist,
    isOpen: station.isOpen ?? undefined,
    source: "live_price",
    prices: {
      e5: availablePrice(station.e5),
      e10: availablePrice(station.e10),
      diesel: availablePrice(station.diesel),
    },
  }));
}

export function isTankerkonigCoverage(input: {
  latitude: number;
  longitude: number;
}) {
  return (
    input.latitude >= 47 &&
    input.latitude <= 55.2 &&
    input.longitude >= 5.5 &&
    input.longitude <= 15.6
  );
}

export function overpassFuelQuery(input: {
  latitude: number;
  longitude: number;
  radiusKm: number;
}) {
  const radius = Math.round(input.radiusKm * 1_000);
  return `[out:json][timeout:12];node["amenity"="fuel"](around:${radius},${input.latitude},${input.longitude});out tags 60;`;
}

export function normalizeOverpassResponse(
  input: unknown,
  center: { latitude: number; longitude: number },
) {
  const parsed = overpassResponseSchema.parse(input);
  return parsed.elements
    .flatMap((element): RoadbookFuelStation[] => {
      const latitude = element.lat ?? element.center?.lat;
      const longitude = element.lon ?? element.center?.lon;
      if (latitude === undefined || longitude === undefined) return [];
      const tags = element.tags ?? {};
      const name = (tags.name || tags.brand || "Fuel station").trim();
      const street = [tags["addr:street"], tags["addr:housenumber"]]
        .filter(Boolean)
        .join(" ");
      const locality = [tags["addr:postcode"], tags["addr:city"]]
        .filter(Boolean)
        .join(" ");
      return [
        {
          id: `osm-${element.type}-${element.id}`,
          name,
          brand: tags.brand?.trim() || undefined,
          address:
            tags["addr:full"] || [street, locality].filter(Boolean).join(", "),
          latitude,
          longitude,
          distanceKm: distanceKm(center, { latitude, longitude }),
          prices: {},
          source: "directory",
        },
      ];
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 40);
}

function distanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(from.latitude)) *
      Math.cos(radians(to.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6_371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function tankerkoenigUrl(
  input: z.infer<typeof roadbookFuelQuerySchema>,
  apiKey: string,
) {
  const url = new URL("https://creativecommons.tankerkoenig.de/json/list.php");
  url.searchParams.set("lat", String(input.latitude));
  url.searchParams.set("lng", String(input.longitude));
  url.searchParams.set("rad", String(input.radiusKm));
  url.searchParams.set("type", input.fuelType);
  url.searchParams.set("sort", input.fuelType === "all" ? "dist" : "price");
  url.searchParams.set("apikey", apiKey);
  return url;
}
