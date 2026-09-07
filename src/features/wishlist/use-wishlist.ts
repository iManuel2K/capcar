"use client";

import { useSyncExternalStore } from "react";

import {
  readWishlist,
  WISHLIST_STORAGE_EVENT,
  WISHLIST_STORAGE_KEY,
} from "@/features/wishlist/wishlist-storage";
import type { WishlistItem } from "@/features/wishlist/wishlist-schema";

const empty: WishlistItem[] = [];
let cachedRaw: string | null | undefined;
let cached = empty;

function snapshot() {
  const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = readWishlist(window.localStorage);
  }
  return cached;
}

function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === WISHLIST_STORAGE_KEY) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(WISHLIST_STORAGE_EVENT, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WISHLIST_STORAGE_EVENT, notify);
  };
}

export function useWishlist(vehicleId: string) {
  return useSyncExternalStore(subscribe, snapshot, () => empty).filter(
    (item) => item.vehicleId === vehicleId,
  );
}
