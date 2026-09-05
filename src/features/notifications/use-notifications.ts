"use client";

import { useSyncExternalStore } from "react";

import type { NotificationItem } from "@/features/notifications/notification-schema";
import { NOTIFICATION_INBOX_KEY, NOTIFICATION_STORAGE_EVENT, readNotifications } from "@/features/notifications/notification-storage";

const empty: NotificationItem[] = [];
let cachedRaw: string | null | undefined;
let cached = empty;

function snapshot() {
  const raw = window.localStorage.getItem(NOTIFICATION_INBOX_KEY);
  if (raw !== cachedRaw) { cachedRaw = raw; cached = readNotifications(window.localStorage); }
  return cached;
}
function subscribe(listener: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === NOTIFICATION_INBOX_KEY) listener(); };
  window.addEventListener("storage", storage);
  window.addEventListener(NOTIFICATION_STORAGE_EVENT, listener);
  return () => { window.removeEventListener("storage", storage); window.removeEventListener(NOTIFICATION_STORAGE_EVENT, listener); };
}
export function useNotifications() { return useSyncExternalStore(subscribe, snapshot, () => empty); }
