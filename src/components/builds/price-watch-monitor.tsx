"use client";

import { useEffect } from "react";

import { runAutomaticPriceChecks } from "@/features/builds/automatic-price-monitor";
import {
  importCloudPriceWatchResults,
  syncCloudPriceWatches,
} from "@/features/builds/cloud-price-watch";
import { announceBuildChange } from "@/features/builds/build-storage";
import {
  announceNotificationChange,
  appendNotifications,
  readNotificationPreferences,
} from "@/features/notifications/notification-storage";
import type { NotificationItem } from "@/features/notifications/notification-schema";
import { createClient } from "@/lib/supabase/client";

let lastRun = 0;

export function PriceWatchMonitor() {
  useEffect(() => {
    let cancelled = false;
    let running = false;
    async function check() {
      if (
        cancelled ||
        running ||
        document.visibilityState === "hidden" ||
        Date.now() - lastRun < 10 * 60 * 1000
      )
        return;
      running = true;
      lastRun = Date.now();
      try {
        const notifications: NotificationItem[] = [];
        let changed = false;
        let cloudUserId = "";
        let cloudClient: ReturnType<typeof createClient> | undefined;
        try {
          cloudClient = createClient();
          const { data } = await cloudClient.auth.getUser();
          cloudUserId = data.user?.id ?? "";
          if (cloudUserId) {
            await syncCloudPriceWatches(
              cloudClient,
              cloudUserId,
              window.localStorage,
            );
            const imported = await importCloudPriceWatchResults(
              cloudClient,
              cloudUserId,
              window.localStorage,
            );
            changed ||= imported.changed;
            notifications.push(...imported.notifications);
          }
        } catch {
          // Browser checks remain available if cloud scheduling is not ready.
        }
        const result = await runAutomaticPriceChecks(window.localStorage);
        changed ||= result.changed;
        notifications.push(...result.notifications);
        if (cloudClient && cloudUserId) {
          try {
            await syncCloudPriceWatches(
              cloudClient,
              cloudUserId,
              window.localStorage,
            );
          } catch {
            // The local result is kept and will sync on a later Garage visit.
          }
        }
        if (cancelled || !changed) return;
        announceBuildChange();
        if (
          notifications.length &&
          readNotificationPreferences(window.localStorage).enabled &&
          readNotificationPreferences(window.localStorage).priceWatchAlerts
        ) {
          appendNotifications(notifications, window.localStorage);
          announceNotificationChange();
        }
      } finally {
        running = false;
      }
    }
    const timer = window.setTimeout(() => void check(), 1_500);
    const onVisibility = () => void check();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return null;
}
