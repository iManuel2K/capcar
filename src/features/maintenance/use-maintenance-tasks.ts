"use client";

import { useSyncExternalStore } from "react";

import type { MaintenanceTask } from "@/features/maintenance/maintenance-schema";
import {
  getMaintenanceTasks,
  MAINTENANCE_STORAGE_EVENT,
  MAINTENANCE_STORAGE_KEY,
} from "@/features/maintenance/maintenance-storage";

const emptySnapshot: MaintenanceTask[] = [];
let cachedRaw: string | null | undefined;
let cachedTasks = new Map<string, MaintenanceTask[]>();

function getSnapshot(vehicleId: string) {
  const raw = window.localStorage.getItem(MAINTENANCE_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedTasks = new Map();
  }

  const existing = cachedTasks.get(vehicleId);
  if (existing) return existing;

  const tasks = getMaintenanceTasks(vehicleId, window.localStorage);
  cachedTasks.set(vehicleId, tasks);
  return tasks;
}

function subscribe(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === MAINTENANCE_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(MAINTENANCE_STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(MAINTENANCE_STORAGE_EVENT, onStoreChange);
  };
}

export function useMaintenanceTasks(vehicleId: string) {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(vehicleId),
    () => emptySnapshot,
  );
}
