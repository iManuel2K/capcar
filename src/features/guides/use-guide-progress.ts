"use client";

import { useSyncExternalStore } from "react";

import {
  GUIDE_PROGRESS_EVENT,
  GUIDE_PROGRESS_KEY,
  readGuideProgress,
  type GuideProgress,
} from "@/features/guides/guide-progress";

const emptySnapshot: GuideProgress[] = [];
let cachedRaw: string | null | undefined;
let cachedProgress: GuideProgress[] = emptySnapshot;

function getSnapshot() {
  const raw = window.localStorage.getItem(GUIDE_PROGRESS_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedProgress = readGuideProgress(window.localStorage);
  }
  return cachedProgress;
}

function subscribe(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === GUIDE_PROGRESS_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(GUIDE_PROGRESS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(GUIDE_PROGRESS_EVENT, onStoreChange);
  };
}

export function useGuideProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot);
}
