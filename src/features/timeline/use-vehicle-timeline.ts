"use client";

import { useSyncExternalStore } from "react";
import {
  DIAGNOSTIC_STORAGE_EVENT,
  DIAGNOSTIC_STORAGE_KEY,
} from "@/features/diagnostics/diagnostic-storage";
import {
  INSTALL_STAMP_STORAGE_EVENT,
  INSTALL_STAMP_STORAGE_KEY,
} from "@/features/specialists/install-stamp-storage";

import {
  BUILD_STORAGE_EVENT,
  BUILD_STORAGE_KEY,
} from "@/features/builds/build-storage";
import {
  GUIDE_PROGRESS_EVENT,
  GUIDE_PROGRESS_KEY,
} from "@/features/guides/guide-progress";
import {
  MAINTENANCE_STORAGE_EVENT,
  MAINTENANCE_STORAGE_KEY,
} from "@/features/maintenance/maintenance-storage";
import {
  buildVehicleTimeline,
  type VehicleTimelineEvent,
} from "@/features/timeline/vehicle-timeline";
import {
  VEHICLE_STORAGE_EVENT,
  VEHICLE_STORAGE_KEY,
} from "@/features/vehicles/vehicle-storage";
import {
  VEHICLE_RESOLUTION_EVENT,
  VEHICLE_RESOLUTION_KEY,
} from "@/features/vehicle-data/vehicle-resolution-storage";
import {
  BUILD_VISUAL_STORAGE_EVENT,
  BUILD_VISUAL_STORAGE_KEY,
} from "@/features/visualizer/build-visual-storage";
import {
  TUNING_STORAGE_EVENT,
  TUNING_STORAGE_KEY,
} from "@/features/tuning/tuning-storage";

const keys = [
  DIAGNOSTIC_STORAGE_KEY,
  INSTALL_STAMP_STORAGE_KEY,
  VEHICLE_STORAGE_KEY,
  MAINTENANCE_STORAGE_KEY,
  BUILD_STORAGE_KEY,
  GUIDE_PROGRESS_KEY,
  VEHICLE_RESOLUTION_KEY,
  BUILD_VISUAL_STORAGE_KEY,
  TUNING_STORAGE_KEY,
];
const customEvents = [
  DIAGNOSTIC_STORAGE_EVENT,
  INSTALL_STAMP_STORAGE_EVENT,
  VEHICLE_STORAGE_EVENT,
  MAINTENANCE_STORAGE_EVENT,
  BUILD_STORAGE_EVENT,
  GUIDE_PROGRESS_EVENT,
  VEHICLE_RESOLUTION_EVENT,
  BUILD_VISUAL_STORAGE_EVENT,
  TUNING_STORAGE_EVENT,
];
const emptySnapshot: VehicleTimelineEvent[] = [];
const cache = new Map<
  string,
  { signature: string; events: VehicleTimelineEvent[] }
>();

export function useVehicleTimeline(vehicleId: string) {
  function getSnapshot() {
    const signature = keys
      .map((key) => window.localStorage.getItem(key) ?? "")
      .join("|");
    const cached = cache.get(vehicleId);
    if (cached?.signature === signature) return cached.events;
    const events = buildVehicleTimeline(vehicleId, window.localStorage);
    cache.set(vehicleId, { signature, events });
    return events;
  }

  function subscribe(onStoreChange: () => void) {
    const handleStorage = (event: StorageEvent) => {
      if (event.key && keys.includes(event.key)) onStoreChange();
    };
    window.addEventListener("storage", handleStorage);
    for (const eventName of customEvents)
      window.addEventListener(eventName, onStoreChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      for (const eventName of customEvents)
        window.removeEventListener(eventName, onStoreChange);
    };
  }

  return useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot);
}
