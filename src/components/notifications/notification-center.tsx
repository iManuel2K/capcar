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
      await registration.showNotification("CapCar reminder preview", {
        body: "Your maintenance reminders are ready.",
        tag: "capcar-preview",
        data: { url: "/notifications" },
      });
    else
      new Notification("CapCar reminder preview", {
        body: "Your maintenance reminders are ready.",
      });
  }

  return (
    <main className="bg-background text-foreground min-h-dvh px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/garage"
          className="text-primary inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="size-4" /> Garage
        </Link>
        <header className="mt-8 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_12%,rgba(184,199,217,0.2),transparent_30%),#111111] p-6 sm:p-10">
          <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
            Epic 25 · Maintenance reminders
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            Nothing important should surprise you.
          </h1>
          <p className="text-muted-foreground mt-5 max-w-2xl leading-7">
            CapCar creates reminders from the maintenance history on this
            device. Browser alerts are opt-in and quiet hours remain under your
            control.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={refresh}
              className="bg-primary text-primary-foreground min-h-11 rounded-xl px-4 text-sm font-semibold"
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
          <div className="bg-card rounded-[2rem] border border-white/10 p-5 sm:p-7">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-muted-foreground text-xs tracking-[0.13em] uppercase">
                  Notification centre
                </p>
                <h2 className="mt-2 text-2xl font-medium">{unread} unread</h2>
              </div>
              <BellRing className="text-primary size-5" />
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
                      className={`font-medium ${item.readAt ? "text-muted-foreground" : "text-white/80"}`}
                    >
                      {item.title}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-sm">
                      {item.vehicleLabel} · {item.detail}
                    </span>
                  </span>
                </Link>
              ))}
              {notifications.length === 0 && (
                <div className="py-16 text-center">
                  <Bell className="text-muted-foreground mx-auto size-6" />
                  <p className="text-muted-foreground mt-4">
                    No due reminders yet.
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Add sample maintenance history or complete service records
                    first.
                  </p>
                </div>
              )}
            </div>
          </div>
          <aside className="space-y-5">
            <div className="bg-card rounded-[2rem] border border-white/10 p-6">
              <h2 className="text-xl font-medium">Reminder settings</h2>
              <label className="text-muted-foreground mt-6 flex items-center justify-between gap-4 text-sm">
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
                  className="accent-primary size-4"
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
              <label className="text-muted-foreground mt-5 block text-xs">
                Remind this many days before due
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={preferences.daysBeforeDue}
                  onChange={(e) =>
                    update({ daysBeforeDue: Number(e.target.value) })
                  }
                  className="text-foreground mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3"
                />
              </label>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <label className="text-muted-foreground text-xs">
                  Quiet from
                  <input
                    type="time"
                    value={preferences.quietHoursStart}
                    onChange={(e) =>
                      update({ quietHoursStart: e.target.value })
                    }
                    className="text-foreground mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3"
                  />
                </label>
                <label className="text-muted-foreground text-xs">
                  Until
                  <input
                    type="time"
                    value={preferences.quietHoursEnd}
                    onChange={(e) => update({ quietHoursEnd: e.target.value })}
                    className="text-foreground mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3"
                  />
                </label>
              </div>
            </div>
            <div className="bg-card rounded-[2rem] border border-white/10 p-6">
              <p className="text-muted-foreground text-xs tracking-[0.13em] uppercase">
                Browser permission
              </p>
              <p className="mt-3 text-xl font-medium capitalize">
                {permission}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {permission !== "granted" && permission !== "unsupported" && (
                  <button
                    onClick={enableBrowserNotifications}
                    className="bg-primary text-primary-foreground min-h-11 rounded-xl px-4 text-sm font-semibold"
                  >
                    Enable alerts
                  </button>
                )}
                <button
                  disabled={permission !== "granted"}
                  onClick={sendPreview}
                  className="text-muted-foreground min-h-11 rounded-xl border border-white/10 px-4 text-sm disabled:opacity-30"
                >
                  Send preview
                </button>
              </div>
            </div>
            <div className="border-primary/15 bg-primary/6 text-muted-foreground flex gap-3 rounded-2xl border p-5 text-sm leading-6">
              <ShieldCheck className="text-primary mt-0.5 size-4 shrink-0" />
              In-app reminders update whenever CapCar opens. Alerts while every
              device is offline require a later server push service and are not
              claimed here.
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
