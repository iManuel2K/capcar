"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellRing,
  CheckCheck,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { isWithinQuietHours } from "@/features/notifications/notification-engine";
import {
  defaultNotificationPreferences,
  type NotificationPreferences,
} from "@/features/notifications/notification-schema";
import {
  announceNotificationChange,
  markAllNotificationsRead,
  markNotificationRead,
  readNotificationPreferences,
  saveNotificationPreferences,
  syncMaintenanceNotifications,
} from "@/features/notifications/notification-storage";
import { useNotifications } from "@/features/notifications/use-notifications";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export function NotificationCenter() {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const notifications = useNotifications();
  const [preferences, setPreferences] = useState<NotificationPreferences>(() =>
    typeof window === "undefined"
      ? defaultNotificationPreferences
      : readNotificationPreferences(window.localStorage),
  );
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >(() =>
    typeof window === "undefined"
      ? "default"
      : "Notification" in window
        ? Notification.permission
        : "unsupported",
  );

  if (!hydrated)
    return (
      <div className="min-h-[680px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  const unread = notifications.filter((item) => !item.readAt).length;

  function update(changes: Partial<NotificationPreferences>) {
    const next = saveNotificationPreferences(
      { ...preferences, ...changes },
      window.localStorage,
    );
    setPreferences(next);
    syncMaintenanceNotifications(vehicles, window.localStorage);
    announceNotificationChange();
  }
  function refresh() {
    syncMaintenanceNotifications(vehicles, window.localStorage);
    announceNotificationChange();
  }
  async function enableBrowserNotifications() {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  }
  async function sendPreview() {
    if (permission !== "granted") return;
    const now = new Date();
    if (
      isWithinQuietHours(
        now.getHours(),
        now.getMinutes(),
        preferences.quietHoursStart,
        preferences.quietHoursEnd,
      )
    )
      return;
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration)
      await registration.showNotification("Capcar reminder preview", {
        body: "Your maintenance reminders are ready.",
        tag: "capcar-preview",
        data: { url: "/notifications" },
      });
    else
      new Notification("Capcar reminder preview", {
        body: "Your maintenance reminders are ready.",
      });
  }

  return (
    <main className="min-h-dvh bg-[#0b0e0c] px-5 py-12 text-[#f4f5f2]">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/garage"
          className="inline-flex items-center gap-2 text-sm text-[#ff667a]"
        >
          <ArrowLeft className="size-4" /> Garage
        </Link>
        <header className="mt-8 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_12%,rgba(231,45,69,0.2),transparent_30%),#111111] p-6 sm:p-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#ff667a] uppercase">
            Epic 25 · Maintenance reminders
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            Nothing important should surprise you.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/45">
            Capcar creates reminders from the maintenance history on this
            device. Browser alerts are opt-in and quiet hours remain under your
            control.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={refresh}
              className="min-h-11 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-[#07101d]"
            >
              Refresh reminders
            </button>
            {unread > 0 && (
              <button
                onClick={() => {
                  markAllNotificationsRead(window.localStorage);
                  announceNotificationChange();
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/60"
              >
                <CheckCheck className="size-4" /> Mark all read
              </button>
            )}
          </div>
        </header>
        <section className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-7">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs tracking-[0.13em] text-white/30 uppercase">
                  Notification centre
                </p>
                <h2 className="mt-2 text-2xl font-medium">{unread} unread</h2>
              </div>
              <BellRing className="size-5 text-[#ff667a]" />
            </div>
            <div className="mt-6 divide-y divide-white/8">
              {notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    markNotificationRead(item.id, window.localStorage);
                    announceNotificationChange();
                  }}
                  className="flex gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <span
                    className={`mt-1 grid size-10 shrink-0 place-items-center rounded-xl ${item.urgency === "overdue" ? "bg-red-300/10 text-red-200" : "bg-amber-300/10 text-amber-200"}`}
                  >
                    {item.urgency === "overdue" ? (
                      <AlertTriangle className="size-4" />
                    ) : (
                      <Clock3 className="size-4" />
                    )}
                  </span>
                  <span>
                    <span
                      className={`font-medium ${item.readAt ? "text-white/45" : "text-white/80"}`}
                    >
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm text-white/35">
                      {item.vehicleLabel} · {item.detail}
                    </span>
                  </span>
                </Link>
              ))}
              {notifications.length === 0 && (
                <div className="py-16 text-center">
                  <Bell className="mx-auto size-6 text-white/25" />
                  <p className="mt-4 text-white/45">No due reminders yet.</p>
                  <p className="mt-2 text-sm text-white/30">
                    Add sample maintenance history or complete service records
                    first.
                  </p>
                </div>
              )}
            </div>
          </div>
          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-6">
              <h2 className="text-xl font-medium">Reminder settings</h2>
              <label className="mt-6 flex items-center justify-between gap-4 text-sm text-white/55">
                <span>Maintenance reminders</span>
                <input
                  type="checkbox"
                  checked={preferences.maintenanceReminders}
                  onChange={(e) =>
                    update({
                      maintenanceReminders: e.target.checked,
                      enabled: e.target.checked,
                    })
                  }
                  className="size-4 accent-[#e72d45]"
                />
              </label>
              <label className="flex min-h-11 items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.priceWatchAlerts}
                  onChange={(event) =>
                    update({ priceWatchAlerts: event.target.checked })
                  }
                />
                Price-watch alerts
              </label>
              <label className="mt-5 block text-xs text-white/40">
                Remind this many days before due
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={preferences.daysBeforeDue}
                  onChange={(e) =>
                    update({ daysBeforeDue: Number(e.target.value) })
                  }
                  className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3 text-white"
                />
              </label>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <label className="text-xs text-white/40">
                  Quiet from
                  <input
                    type="time"
                    value={preferences.quietHoursStart}
                    onChange={(e) =>
                      update({ quietHoursStart: e.target.value })
                    }
                    className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3 text-white"
                  />
                </label>
                <label className="text-xs text-white/40">
                  Until
                  <input
                    type="time"
                    value={preferences.quietHoursEnd}
                    onChange={(e) => update({ quietHoursEnd: e.target.value })}
                    className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3 text-white"
                  />
                </label>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-6">
              <p className="text-xs tracking-[0.13em] text-white/30 uppercase">
                Browser permission
              </p>
              <p className="mt-3 text-xl font-medium capitalize">
                {permission}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {permission !== "granted" && permission !== "unsupported" && (
                  <button
                    onClick={enableBrowserNotifications}
                    className="min-h-11 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-[#07101d]"
                  >
                    Enable alerts
                  </button>
                )}
                <button
                  disabled={permission !== "granted"}
                  onClick={sendPreview}
                  className="min-h-11 rounded-xl border border-white/10 px-4 text-sm text-white/55 disabled:opacity-30"
                >
                  Send preview
                </button>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-[#e72d45]/15 bg-[#e72d45]/6 p-5 text-sm leading-6 text-white/45">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#9ec2ff]" />
              In-app reminders update whenever Capcar opens. Alerts while every
              device is offline require a later server push service and are not
              claimed here.
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
