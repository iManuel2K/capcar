"use client";

import { useSyncExternalStore } from "react";

import {
  readVehicles,
  VEHICLE_STORAGE_EVENT,
  VEHICLE_STORAGE_KEY,
} from "@/features/vehicles/vehicle-storage";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

const emptySnapshot: Vehicle[] = [];
let cachedRaw: string | null | undefined;
let cachedVehicles: Vehicle[] = emptySnapshot;

function getSnapshot() {
  const raw = window.localStorage.getItem(VEHICLE_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedVehicles = readVehicles(window.localStorage);
  }
  return cachedVehicles;
}

function getServerSnapshot() {
  return emptySnapshot;
}

function subscribe(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === VEHICLE_STORAGE_KEY) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(VEHICLE_STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(VEHICLE_STORAGE_EVENT, onStoreChange);
  };
}

export function useVehicles() {
  const vehicles = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { vehicles, isReady: true };
}
