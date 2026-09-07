"use client";

import { useSyncExternalStore } from "react";
import {
  COST_STORAGE_EVENT,
  COST_STORAGE_KEY,
  readCostState,
} from "@/features/costs/cost-storage";
import type { CostState } from "@/features/costs/cost-schema";

const empty: CostState = { budgets: {}, entries: [] };
let rawCache: string | null | undefined;
let cache = empty;
function snapshot() {
  const raw = window.localStorage.getItem(COST_STORAGE_KEY);
  if (raw !== rawCache) {
    rawCache = raw;
    cache = readCostState(window.localStorage);
  }
  return cache;
}
function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === COST_STORAGE_KEY) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(COST_STORAGE_EVENT, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(COST_STORAGE_EVENT, notify);
  };
}
export function useCostState() {
  return useSyncExternalStore(subscribe, snapshot, () => empty);
}
