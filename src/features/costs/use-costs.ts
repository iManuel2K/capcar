"use client";

import { useSyncExternalStore } from "react";
import {
  COST_STORAGE_EVENT,
  COST_STORAGE_KEY,
  readCostState,
} from "@/features/costs/cost-storage";
import type { CostState } from "@/features/costs/cost-schema";
import {
  BUILD_STORAGE_KEY,
  BUILD_STORAGE_EVENT,
} from "@/features/builds/build-storage";

const empty: CostState = { budgets: {}, entries: [] };
let rawCache: string | null | undefined;
let cache = empty;
function snapshot() {
  let raw: string;
  try {
    raw = JSON.stringify([
      window.localStorage.getItem(COST_STORAGE_KEY),
      window.localStorage.getItem(BUILD_STORAGE_KEY),
    ]);
  } catch {
    return empty;
  }
  if (raw !== rawCache) {
    rawCache = raw;
    cache = readCostState(window.localStorage);
  }
  return cache;
}
function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === COST_STORAGE_KEY ||
      event.key === BUILD_STORAGE_KEY
    )
      notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(COST_STORAGE_EVENT, notify);
  window.addEventListener(BUILD_STORAGE_EVENT, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(COST_STORAGE_EVENT, notify);
    window.removeEventListener(BUILD_STORAGE_EVENT, notify);
  };
}
export function useCostState() {
  return useSyncExternalStore(subscribe, snapshot, () => empty);
}
