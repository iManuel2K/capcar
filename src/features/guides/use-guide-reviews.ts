"use client";

import { useSyncExternalStore } from "react";

import type { GuideReviewRecord } from "@/features/guides/guide-review-schema";
import { GUIDE_REVIEW_STORAGE_EVENT, GUIDE_REVIEW_STORAGE_KEY, readGuideReviews } from "@/features/guides/guide-review-storage";

const empty: GuideReviewRecord[] = [];
let cachedRaw: string | null | undefined;
let cached = empty;

function snapshot() {
  const raw = window.localStorage.getItem(GUIDE_REVIEW_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = readGuideReviews(window.localStorage);
  }
  return cached;
}

function subscribe(listener: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === GUIDE_REVIEW_STORAGE_KEY) listener(); };
  window.addEventListener("storage", storage);
  window.addEventListener(GUIDE_REVIEW_STORAGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(GUIDE_REVIEW_STORAGE_EVENT, listener);
  };
}

export function useGuideReviews() {
  return useSyncExternalStore(subscribe, snapshot, () => empty);
}
