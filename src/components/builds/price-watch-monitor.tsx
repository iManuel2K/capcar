"use client";

import { useEffect } from "react";

import { runAutomaticPriceChecks } from "@/features/builds/automatic-price-monitor";
import { announceBuildChange } from "@/features/builds/build-storage";
import {
  announceNotificationChange,
  appendNotifications,
  readNotificationPreferences,
} from "@/features/notifications/notification-storage";

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
        const result = await runAutomaticPriceChecks(window.localStorage);
        if (cancelled || !result.changed) return;
        announceBuildChange();
        if (
          result.notifications.length &&
          readNotificationPreferences(window.localStorage).enabled &&
          readNotificationPreferences(window.localStorage).priceWatchAlerts
        ) {
          appendNotifications(result.notifications, window.localStorage);
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
