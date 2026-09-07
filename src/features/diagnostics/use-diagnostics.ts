"use client";

import { useSyncExternalStore } from "react";
import {
  DIAGNOSTIC_STORAGE_EVENT,
  DIAGNOSTIC_STORAGE_KEY,
  readDiagnostics,
} from "@/features/diagnostics/diagnostic-storage";
import type { DiagnosticLog } from "@/features/diagnostics/diagnostic-schema";

const empty: DiagnosticLog[] = [];
let rawCache: string | null | undefined;
let cache = empty;
function snapshot() {
  const raw = window.localStorage.getItem(DIAGNOSTIC_STORAGE_KEY);
  if (raw !== rawCache) {
    rawCache = raw;
    cache = readDiagnostics(window.localStorage);
  }
  return cache;
}
function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === DIAGNOSTIC_STORAGE_KEY) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(DIAGNOSTIC_STORAGE_EVENT, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DIAGNOSTIC_STORAGE_EVENT, notify);
  };
}
export function useDiagnostics(vehicleId: string) {
  return useSyncExternalStore(subscribe, snapshot, () => empty).filter(
    (record) => record.vehicleId === vehicleId,
  );
}
