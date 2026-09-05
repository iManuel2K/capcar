"use client";

import { useSyncExternalStore } from "react";

import {
  BUILD_VISUAL_STORAGE_EVENT,
  BUILD_VISUAL_STORAGE_KEY,
  readBuildVisuals,
} from "@/features/visualizer/build-visual-storage";
import type { BuildVisual } from "@/features/visualizer/build-visual-schema";

const emptySnapshot: BuildVisual[] = [];
let cachedRaw: string | null | undefined;
let cachedVisuals: BuildVisual[] = emptySnapshot;

function getSnapshot() {
  const raw = window.localStorage.getItem(BUILD_VISUAL_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedVisuals = readBuildVisuals(window.localStorage);
  }
  return cachedVisuals;
}

function subscribe(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === BUILD_VISUAL_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(BUILD_VISUAL_STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(BUILD_VISUAL_STORAGE_EVENT, onStoreChange);
  };
}

export function useBuildVisuals() {
  return useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot);
}
