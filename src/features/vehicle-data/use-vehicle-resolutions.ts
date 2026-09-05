"use client";

import { useSyncExternalStore } from "react";

import {
  readVehicleResolutions,
  VEHICLE_RESOLUTION_EVENT,
  VEHICLE_RESOLUTION_KEY,
  type VehicleResolutionRecord,
} from "@/features/vehicle-data/vehicle-resolution-storage";

const emptySnapshot: VehicleResolutionRecord[] = [];
let cachedRaw: string | null | undefined;
let cachedRecords: VehicleResolutionRecord[] = emptySnapshot;

function getSnapshot() {
  const raw = window.localStorage.getItem(VEHICLE_RESOLUTION_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedRecords = readVehicleResolutions(window.localStorage);
  }
  return cachedRecords;
}

function subscribe(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === VEHICLE_RESOLUTION_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(VEHICLE_RESOLUTION_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(VEHICLE_RESOLUTION_EVENT, onStoreChange);
  };
}

export function useVehicleResolutions() {
  return useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot);
}
