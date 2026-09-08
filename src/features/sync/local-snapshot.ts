import { z } from "zod";

import {
  BUILD_STORAGE_EVENT,
  BUILD_STORAGE_KEY,
} from "@/features/builds/build-storage";
import {
  COST_STORAGE_EVENT,
  COST_STORAGE_KEY,
} from "@/features/costs/cost-storage";
import {
  DIAGNOSTIC_STORAGE_EVENT,
  DIAGNOSTIC_STORAGE_KEY,
} from "@/features/diagnostics/diagnostic-storage";
import {
  GUIDE_PROGRESS_EVENT,
  GUIDE_PROGRESS_KEY,
} from "@/features/guides/guide-progress";
import {
  GUIDE_REVIEW_STORAGE_EVENT,
  GUIDE_REVIEW_STORAGE_KEY,
} from "@/features/guides/guide-review-storage";
import {
  MAINTENANCE_STORAGE_EVENT,
  MAINTENANCE_STORAGE_KEY,
} from "@/features/maintenance/maintenance-storage";
import {
  NOTIFICATION_INBOX_KEY,
  NOTIFICATION_PREFERENCES_KEY,
  NOTIFICATION_STORAGE_EVENT,
} from "@/features/notifications/notification-storage";
import {
  INSTALL_STAMP_STORAGE_EVENT,
  INSTALL_STAMP_STORAGE_KEY,
} from "@/features/specialists/install-stamp-storage";
import {
  TUNING_STORAGE_EVENT,
  TUNING_STORAGE_KEY,
} from "@/features/tuning/tuning-storage";
import {
  VEHICLE_RESOLUTION_EVENT,
  VEHICLE_RESOLUTION_KEY,
} from "@/features/vehicle-data/vehicle-resolution-storage";
import {
  VEHICLE_STORAGE_EVENT,
  VEHICLE_STORAGE_KEY,
} from "@/features/vehicles/vehicle-storage";
import {
  BUILD_VISUAL_STORAGE_EVENT,
  BUILD_VISUAL_STORAGE_KEY,
} from "@/features/visualizer/build-visual-storage";
import {
  WISHLIST_STORAGE_EVENT,
  WISHLIST_STORAGE_KEY,
} from "@/features/wishlist/wishlist-storage";

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
  COST_STORAGE_KEY,
  DIAGNOSTIC_STORAGE_KEY,
  WISHLIST_STORAGE_KEY,
  INSTALL_STAMP_STORAGE_KEY,
] as const;

export const garageStorageEvents = [
  VEHICLE_STORAGE_EVENT,
  MAINTENANCE_STORAGE_EVENT,
  BUILD_STORAGE_EVENT,
  GUIDE_PROGRESS_EVENT,
  GUIDE_REVIEW_STORAGE_EVENT,
  VEHICLE_RESOLUTION_EVENT,
  BUILD_VISUAL_STORAGE_EVENT,
  TUNING_STORAGE_EVENT,
  NOTIFICATION_STORAGE_EVENT,
  COST_STORAGE_EVENT,
  DIAGNOSTIC_STORAGE_EVENT,
  WISHLIST_STORAGE_EVENT,
  INSTALL_STAMP_STORAGE_EVENT,
] as const;

export const localSnapshotSchema = z.object({
  version: z.literal(1),
  capturedAt: z.string().datetime(),
  data: z.record(z.string(), z.string()),
});

export type LocalSnapshot = z.infer<typeof localSnapshotSchema>;
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
  const snapshot = localSnapshotSchema.parse(input);
  for (const key of snapshotKeys) {
    const value = snapshot.data[key];
    if (value !== undefined) storage.setItem(key, value);
  }
  return snapshot;
}

export function hasSnapshotData(snapshot: LocalSnapshot) {
  return Object.keys(snapshot.data).length > 0;
}

export function snapshotsMatch(left: LocalSnapshot, right: LocalSnapshot) {
  return JSON.stringify(left.data) === JSON.stringify(right.data);
}

export function clearLocalSnapshot(storage: ClearableStorage) {
  for (const key of snapshotKeys) storage.removeItem(key);
}
