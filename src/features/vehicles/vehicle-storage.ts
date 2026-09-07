import {
  type NormalizedVehicleInput,
  type Vehicle,
  vehicleInputSchema,
  vehicleSchema,
} from "@/features/vehicles/vehicle-schema";

export const VEHICLE_STORAGE_KEY = "capcar.vehicles.v1";
export const VEHICLE_STORAGE_EVENT = "capcar:vehicles-changed";
export const SHOWCASE_GARAGE_KEY = "capcar.showcase-garage.v1";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

const showcaseVehicles: Array<{
  input: NormalizedVehicleInput;
  id: string;
  createdAt: string;
}> = [
  {
    id: "demo-bmw-318i-e90",
    createdAt: "2026-09-07T12:04:00.000Z",
    input: {
      make: "BMW",
      model: "318i",
      productionYear: 2011,
      platform: "E90",
      bodyStyle: "Sedan",
      engineCode: "N43B20",
      transmission: "Manual",
      mileage: 148200,
      color: "Black Sapphire",
      nickname: "Project 318",
      imageUrl: "/capcar-bmw-current-side.webp",
      demoProject: true,
    },
  },
  {
    id: "demo-ford-f150-night-shift",
    createdAt: "2026-09-07T12:03:00.000Z",
    input: {
      make: "Ford",
      model: "F-150",
      productionYear: 2021,
      platform: "P702",
      bodyStyle: "Pickup",
      engineCode: "3.5 ECOBOOST",
      transmission: "Automatic",
      mileage: 63400,
      color: "Agate Black",
      nickname: "Night Shift",
      imageUrl: "/capcar-project-f150.png",
      demoProject: true,
    },
  },
  {
    id: "demo-mercedes-eclass-w213",
    createdAt: "2026-09-07T12:02:00.000Z",
    input: {
      make: "Mercedes-Benz",
      model: "E 300",
      productionYear: 2019,
      platform: "W213",
      bodyStyle: "Sedan",
      engineCode: "M264",
      transmission: "Automatic",
      mileage: 78900,
      color: "Obsidian Black",
      nickname: "Executive Black",
      imageUrl: "/capcar-project-eclass.png",
      demoProject: true,
    },
  },
  {
    id: "demo-vw-gti-tcr",
    createdAt: "2026-09-07T12:01:00.000Z",
    input: {
      make: "Volkswagen",
      model: "Golf GTI TCR",
      productionYear: 2019,
      platform: "MK7.5",
      bodyStyle: "Hatchback",
      engineCode: "EA888",
      transmission: "Automatic",
      mileage: 54800,
      color: "Pure Grey",
      nickname: "Circuit Daily",
      imageUrl: "/capcar-project-gti-tcr.png",
      demoProject: true,
    },
  },
];

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

export function seedShowcaseGarage(storage: WritableStorage) {
  if (storage.getItem(SHOWCASE_GARAGE_KEY)) return false;

  const existing = readVehicles(storage);
  for (const showcase of showcaseVehicles.toReversed()) {
    const duplicate = existing.some(
      (vehicle) =>
        vehicle.make.toLowerCase() === showcase.input.make.toLowerCase() &&
        vehicle.model.toLowerCase() === showcase.input.model.toLowerCase(),
    );
    if (!duplicate) {
      saveVehicle(showcase.input, storage, {
        id: showcase.id,
        createdAt: showcase.createdAt,
      });
    }
  }
  storage.setItem(SHOWCASE_GARAGE_KEY, "seeded");
  return true;
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
