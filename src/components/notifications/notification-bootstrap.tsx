"use client";

import { useEffect } from "react";

import { MAINTENANCE_STORAGE_EVENT } from "@/features/maintenance/maintenance-storage";
import { announceNotificationChange, syncMaintenanceNotifications } from "@/features/notifications/notification-storage";
import { readVehicles, VEHICLE_STORAGE_EVENT } from "@/features/vehicles/vehicle-storage";

export function NotificationBootstrap() {
  useEffect(() => {
    const sync = () => {
      syncMaintenanceNotifications(readVehicles(window.localStorage), window.localStorage);
      announceNotificationChange();
    };
    sync();
    window.addEventListener(MAINTENANCE_STORAGE_EVENT, sync);
    window.addEventListener(VEHICLE_STORAGE_EVENT, sync);
    return () => {
      window.removeEventListener(MAINTENANCE_STORAGE_EVENT, sync);
      window.removeEventListener(VEHICLE_STORAGE_EVENT, sync);
    };
  }, []);
  return null;
}
