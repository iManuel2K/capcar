"use client";

import { useSyncExternalStore } from "react";

import {
  readTuningPlans,
  TUNING_STORAGE_EVENT,
  TUNING_STORAGE_KEY,
} from "@/features/tuning/tuning-storage";
import type { TuningPlan } from "@/features/tuning/tuning-roadmap";

const emptySnapshot: TuningPlan[] = [];
let cachedRaw: string | null | undefined;
let cachedPlans: TuningPlan[] = emptySnapshot;

function getSnapshot() {
  const raw = window.localStorage.getItem(TUNING_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedPlans = readTuningPlans(window.localStorage);
  }
  return cachedPlans;
}

function subscribe(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === TUNING_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(TUNING_STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(TUNING_STORAGE_EVENT, onStoreChange);
  };
}

export function useTuningPlans() {
  return useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot);
}
