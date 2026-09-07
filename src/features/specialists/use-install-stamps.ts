"use client";

import { useSyncExternalStore } from "react";
import {
  INSTALL_STAMP_STORAGE_EVENT,
  INSTALL_STAMP_STORAGE_KEY,
  readInstallStamps,
  type InstallStamp,
} from "@/features/specialists/install-stamp-storage";

const empty: InstallStamp[] = [];
let rawCache: string | null | undefined;
let cache = empty;
function snapshot() {
  const raw = window.localStorage.getItem(INSTALL_STAMP_STORAGE_KEY);
  if (raw !== rawCache) { rawCache = raw; cache = readInstallStamps(window.localStorage); }
  return cache;
}
function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === INSTALL_STAMP_STORAGE_KEY) notify(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(INSTALL_STAMP_STORAGE_EVENT, notify);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(INSTALL_STAMP_STORAGE_EVENT, notify); };
}
export function useInstallStamps(vehicleId: string) { return useSyncExternalStore(subscribe, snapshot, () => empty).filter((item) => item.vehicleId === vehicleId); }
