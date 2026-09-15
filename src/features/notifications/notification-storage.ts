import { getMaintenanceTasks } from "@/features/maintenance/maintenance-storage";
import { createMaintenanceNotifications } from "@/features/notifications/notification-engine";
import {
  defaultNotificationPreferences,
  notificationItemSchema,
  notificationPreferencesSchema,
  type NotificationItem,
  type NotificationPreferences,
} from "@/features/notifications/notification-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

export const NOTIFICATION_INBOX_KEY = "capcar.notifications.v1";
export const NOTIFICATION_PREFERENCES_KEY =
  "capcar.notification-preferences.v1";
export const NOTIFICATION_STORAGE_EVENT = "capcar:notifications-changed";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readNotificationPreferences(storage: ReadableStorage) {
  const raw = storage.getItem(NOTIFICATION_PREFERENCES_KEY);
  if (!raw) return defaultNotificationPreferences;
  try {
    const result = notificationPreferencesSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : defaultNotificationPreferences;
  } catch {
    return defaultNotificationPreferences;
  }
}

export function saveNotificationPreferences(
  preferences: NotificationPreferences,
  storage: WritableStorage,
) {
  const value = notificationPreferencesSchema.parse(preferences);
  storage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(value));
  return value;
}

export function readNotifications(
  storage: ReadableStorage,
): NotificationItem[] {
  const raw = storage.getItem(NOTIFICATION_INBOX_KEY);
  if (!raw) return [];
  try {
    const result = notificationItemSchema.array().safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function syncMaintenanceNotifications(
  vehicles: Vehicle[],
  storage: WritableStorage,
  now = new Date(),
) {
  const preferences = readNotificationPreferences(storage);
  if (!preferences.enabled || !preferences.maintenanceReminders) {
    const retained = readNotifications(storage).filter(
      (item) => item.category !== "maintenance",
    );
    storage.setItem(NOTIFICATION_INBOX_KEY, JSON.stringify(retained));
    return retained;
  }
  const existing = readNotifications(storage);
  const existingById = new Map(existing.map((item) => [item.id, item]));
  const retained = existing.filter((item) => item.category !== "maintenance");
  const next = [
    ...retained,
    ...vehicles
      .flatMap((vehicle) =>
        createMaintenanceNotifications(
          vehicle,
          getMaintenanceTasks(vehicle.id, storage),
          now,
          preferences.daysBeforeDue,
        ),
      )
      .map((item) => ({
        ...item,
        createdAt: existingById.get(item.id)?.createdAt ?? item.createdAt,
        readAt: existingById.get(item.id)?.readAt,
      })),
  ];
  storage.setItem(NOTIFICATION_INBOX_KEY, JSON.stringify(next));
  return next;
}

export function appendNotifications(
  input: NotificationItem[],
  storage: WritableStorage,
) {
  const existing = readNotifications(storage);
  const byId = new Map(existing.map((item) => [item.id, item]));
  for (const candidate of input) {
    const item = notificationItemSchema.parse(candidate);
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  const next = [...byId.values()].slice(-200);
  storage.setItem(NOTIFICATION_INBOX_KEY, JSON.stringify(next));
  return next;
}

export function markNotificationRead(
  id: string,
  storage: WritableStorage,
  now = new Date().toISOString(),
) {
  const next = readNotifications(storage).map((item) =>
    item.id === id ? { ...item, readAt: item.readAt ?? now } : item,
  );
  storage.setItem(NOTIFICATION_INBOX_KEY, JSON.stringify(next));
}

export function markAllNotificationsRead(
  storage: WritableStorage,
  now = new Date().toISOString(),
) {
  storage.setItem(
    NOTIFICATION_INBOX_KEY,
    JSON.stringify(
      readNotifications(storage).map((item) => ({
        ...item,
        readAt: item.readAt ?? now,
      })),
    ),
  );
}

export function announceNotificationChange() {
  window.dispatchEvent(new Event(NOTIFICATION_STORAGE_EVENT));
}
