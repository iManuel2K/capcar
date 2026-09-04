import {
  type NormalizedVehicleInput,
  type Vehicle,
  vehicleInputSchema,
  vehicleSchema,
} from "@/features/vehicles/vehicle-schema";

export const VEHICLE_STORAGE_KEY = "capcar.vehicles.v1";
export const VEHICLE_STORAGE_EVENT = "capcar:vehicles-changed";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readVehicles(storage: ReadableStorage): Vehicle[] {
  const raw = storage.getItem(VEHICLE_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    const result = vehicleSchema.array().safeParse(parsed);
    if (!result.success) return [];

    return result.data.toSorted((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  } catch {
    return [];
  }
}

export function saveVehicle(
  input: NormalizedVehicleInput,
  storage: WritableStorage,
  options?: { id?: string; createdAt?: string },
): Vehicle {
  const normalized = vehicleInputSchema.parse(input);
  const vehicle = vehicleSchema.parse({
    ...normalized,
    id: options?.id ?? crypto.randomUUID(),
    createdAt: options?.createdAt ?? new Date().toISOString(),
  });
  const current = readVehicles(storage);

  storage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify([vehicle, ...current]));
  return vehicle;
}

export function findVehicle(
  vehicleId: string,
  storage: ReadableStorage,
): Vehicle | undefined {
  return readVehicles(storage).find((vehicle) => vehicle.id === vehicleId);
}

export function announceVehicleChange() {
  window.dispatchEvent(new Event(VEHICLE_STORAGE_EVENT));
}
