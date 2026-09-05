import { z } from "zod";

import { resolvedVehicleDataSchema } from "@/features/vehicle-data/vehicle-data-schema";

export const VEHICLE_RESOLUTION_KEY = "capcar.vehicle-resolutions.v1";
export const VEHICLE_RESOLUTION_EVENT = "capcar:vehicle-resolutions-changed";

const vehicleResolutionRecordSchema = resolvedVehicleDataSchema.extend({
  vehicleId: z.string().min(1),
});

export type VehicleResolutionRecord = z.infer<
  typeof vehicleResolutionRecordSchema
>;
type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readVehicleResolutions(
  storage: ReadableStorage,
): VehicleResolutionRecord[] {
  const raw = storage.getItem(VEHICLE_RESOLUTION_KEY);
  if (!raw) return [];
  try {
    const result = vehicleResolutionRecordSchema
      .array()
      .safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function saveVehicleResolution(
  vehicleId: string,
  resolution: unknown,
  storage: WritableStorage,
) {
  const record = vehicleResolutionRecordSchema.parse({
    ...resolvedVehicleDataSchema.parse(resolution),
    vehicleId,
  });
  const others = readVehicleResolutions(storage).filter(
    (candidate) => candidate.vehicleId !== vehicleId,
  );
  storage.setItem(VEHICLE_RESOLUTION_KEY, JSON.stringify([record, ...others]));
  return record;
}

export function announceVehicleResolutionChange() {
  window.dispatchEvent(new Event(VEHICLE_RESOLUTION_EVENT));
}
