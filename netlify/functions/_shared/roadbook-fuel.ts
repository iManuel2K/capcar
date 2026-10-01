import { z } from "zod";

const fuelTypes = ["all", "e5", "e10", "diesel"] as const;

export const roadbookFuelQuerySchema = z.object({
  latitude: z.number().min(47).max(55.2),
  longitude: z.number().min(5.5).max(15.6),
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
};

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
    prices: {
      e5: availablePrice(station.e5),
      e10: availablePrice(station.e10),
      diesel: availablePrice(station.diesel),
    },
  }));
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
