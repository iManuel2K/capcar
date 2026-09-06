import { z } from "zod";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
export const soundScenarios = ["cold-start", "idle", "acceleration", "drive-by", "cabin"] as const;
export const exhaustRecordingSchema = z.object({
  id: z.string().min(1), label: z.string().min(1),
  platform: z.string().min(1), engineCode: z.string().min(1), model: z.string().min(1),
  productionYear: z.number().int(),
  configuration: z.enum(["stock", "modified"]),
  scenario: z.enum(soundScenarios),
  exhaustSystem: z.string().min(1), otherModifications: z.string().min(1),
  source: z.string().url().startsWith("https://"), rights: z.string().min(1), recordingNotes: z.string().min(1),
  audioPath: z.string().regex(/^\/audio\/[A-Za-z0-9_-]+\.(mp3|wav|ogg)$/),
});
export type ExhaustRecording = z.infer<typeof exhaustRecordingSchema>;
// Add only recordings with distribution permission and confirmed setup metadata.
// No recordings are bundled: there is no verified/licensed BMW recording yet.
export const exhaustRecordings: ExhaustRecording[] = [];
export function recordingsForVehicle(vehicle: Vehicle, records = exhaustRecordings) {
  if (vehicle.engineCode.toUpperCase() === "UNKNOWN") return [];
  return records.filter(record => record.platform.toUpperCase() === vehicle.platform.toUpperCase() && record.engineCode.toUpperCase() === vehicle.engineCode.toUpperCase() && record.model.toUpperCase() === vehicle.model.toUpperCase() && record.productionYear === vehicle.productionYear);
}
