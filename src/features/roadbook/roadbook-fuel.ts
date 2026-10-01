import { z } from "zod";

export const roadbookFuelTypes = ["all", "e5", "e10", "diesel"] as const;
export type RoadbookFuelType = (typeof roadbookFuelTypes)[number];

export const roadbookFuelStationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  brand: z.string().optional(),
  address: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  distanceKm: z.number().nonnegative(),
  isOpen: z.boolean().optional(),
  prices: z.object({
    e5: z.number().positive().optional(),
    e10: z.number().positive().optional(),
    diesel: z.number().positive().optional(),
  }),
});

const roadbookFuelResponseSchema = z.object({
  stations: z.array(roadbookFuelStationSchema),
  fetchedAt: z.string().datetime({ offset: true }),
  provider: z.literal("Tankerkönig / MTS-K"),
});

export type RoadbookFuelStation = z.infer<typeof roadbookFuelStationSchema>;

export function roadbookFuelAvailable(center: {
  latitude: number;
  longitude: number;
}) {
  return (
    center.latitude >= 47 &&
    center.latitude <= 55.2 &&
    center.longitude >= 5.5 &&
    center.longitude <= 15.6
  );
}

export async function fetchRoadbookFuelStations(input: {
  latitude: number;
  longitude: number;
  radiusKm: number;
  fuelType: RoadbookFuelType;
  signal?: AbortSignal;
}) {
  const query = new URLSearchParams({
    lat: String(input.latitude),
    lng: String(input.longitude),
    radius: String(Math.min(25, Math.max(1, input.radiusKm))),
    type: input.fuelType,
  });
  const response = await fetch(`/api/roadbook/fuel?${query}`, {
    signal: input.signal,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "FUEL_DATA_UNAVAILABLE");
  }
  return roadbookFuelResponseSchema.parse(await response.json());
}
