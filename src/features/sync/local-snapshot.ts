import { z } from "zod";

import { BUILD_STORAGE_KEY } from "@/features/builds/build-storage";
import { GUIDE_PROGRESS_KEY } from "@/features/guides/guide-progress";
import { MAINTENANCE_STORAGE_KEY } from "@/features/maintenance/maintenance-storage";
import { GUIDE_REVIEW_STORAGE_KEY } from "@/features/guides/guide-review-storage";
import { NOTIFICATION_INBOX_KEY, NOTIFICATION_PREFERENCES_KEY } from "@/features/notifications/notification-storage";
import { TUNING_STORAGE_KEY } from "@/features/tuning/tuning-storage";
import { VEHICLE_RESOLUTION_KEY } from "@/features/vehicle-data/vehicle-resolution-storage";
import { VEHICLE_STORAGE_KEY } from "@/features/vehicles/vehicle-storage";
import { BUILD_VISUAL_STORAGE_KEY } from "@/features/visualizer/build-visual-storage";

export const snapshotKeys = [
  VEHICLE_STORAGE_KEY,
  MAINTENANCE_STORAGE_KEY,
  BUILD_STORAGE_KEY,
  GUIDE_PROGRESS_KEY,
  GUIDE_REVIEW_STORAGE_KEY,
  VEHICLE_RESOLUTION_KEY,
  BUILD_VISUAL_STORAGE_KEY,
  TUNING_STORAGE_KEY,
  NOTIFICATION_INBOX_KEY,
  NOTIFICATION_PREFERENCES_KEY,
] as const;

const snapshotSchema = z.object({
  version: z.literal(1),
  capturedAt: z.string().datetime(),
  data: z.record(z.string(), z.string()),
});

export type LocalSnapshot = z.infer<typeof snapshotSchema>;
type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;
type ClearableStorage = Pick<Storage, "removeItem">;

export function collectLocalSnapshot(
  storage: ReadableStorage,
  now = new Date().toISOString(),
): LocalSnapshot {
  return {
    version: 1,
    capturedAt: now,
    data: Object.fromEntries(
      snapshotKeys.flatMap((key) => {
        const value = storage.getItem(key);
        return value === null ? [] : [[key, value]];
      }),
    ),
  };
}

export function applyLocalSnapshot(
  input: unknown,
  storage: WritableStorage,
): LocalSnapshot {
  const snapshot = snapshotSchema.parse(input);
  for (const key of snapshotKeys) {
    const value = snapshot.data[key];
    if (value !== undefined) storage.setItem(key, value);
  }
  return snapshot;
}

export function clearLocalSnapshot(storage: ClearableStorage) {
  for (const key of snapshotKeys) storage.removeItem(key);
}
