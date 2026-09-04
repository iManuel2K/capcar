"use client";

import { useSyncExternalStore } from "react";

import type { Build, BuildItem } from "@/features/builds/build-schema";
import {
  BUILD_STORAGE_EVENT,
  BUILD_STORAGE_KEY,
  readBuildState,
} from "@/features/builds/build-storage";

type BuildState = { builds: Build[]; items: BuildItem[] };
const emptySnapshot: BuildState = { builds: [], items: [] };
let cachedRaw: string | null | undefined;
let cachedState: BuildState = emptySnapshot;

function getSnapshot() {
  const raw = window.localStorage.getItem(BUILD_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = readBuildState(window.localStorage);
  }
  return cachedState;
}

function subscribe(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === BUILD_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(BUILD_STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(BUILD_STORAGE_EVENT, onStoreChange);
  };
}

export function useBuildState() {
  return useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot);
}
