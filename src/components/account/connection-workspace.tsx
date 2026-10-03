"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Link2,
  LoaderCircle,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

export type ConnectionStatus = {
  configured: boolean;
  connected: boolean;
  message?: string;
  email?: string;
  lastSyncedAt?: string | null;
  syncStatus?: string;
  summary?: {
    busyDates?: string[];
    calendarEventCount?: number;
    mailSignals?: Array<{ subject: string; date?: string }>;
    mailScannedCount?: number;
  } | null;
  permissions?: { calendar: boolean; mailMetadata: boolean };
};

export function ConnectionWorkspace({
  connectionResult,
  initialStatus,
}: {
  connectionResult?: string;
  initialStatus: ConnectionStatus;
}) {
  const t = useTranslations("Connections");
  const [status, setStatus] = useState(initialStatus);
  const [action, setAction] = useState<"sync" | "disconnect">();
  const [message, setMessage] = useState(() =>
    connectionResult === "connected" ? t("connectedMessage") : "",
  );
  const [error, setError] = useState(() => {
    if (connectionResult === "failed") return t("errors.connect");
    if (connectionResult === "unavailable") return t("errors.unavailable");
    return "";
  });

  async function sync() {
    setAction("sync");
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/connections/google/sync", {
        method: "POST",
      });
      const body = (await response.json()) as {
        error?: string;
        summary?: ConnectionStatus["summary"];
        lastSyncedAt?: string;
        syncStatus?: string;
      };
      if (!response.ok) throw new Error(body.error || t("errors.sync"));
      setStatus((current) =>
        current
          ? {
              ...current,
              summary: body.summary,
              lastSyncedAt: body.lastSyncedAt,
              syncStatus: body.syncStatus,
            }
          : current,
      );
      setMessage(t("syncedMessage"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.sync"));
    } finally {
      setAction(undefined);
    }
  }

  async function disconnect() {
    if (!window.confirm(t("disconnectConfirm"))) return;
    setAction("disconnect");
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/connections/google/disconnect", {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || t("errors.disconnect"));
      }
      setStatus((current) =>
        current
          ? {
              ...current,
              connected: false,
              email: undefined,
              summary: null,
              lastSyncedAt: null,
            }
          : current,
      );
      setMessage(t("disconnectedMessage"));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("errors.disconnect"),
      );
    } finally {
      setAction(undefined);
    }
  }

  return (
    <main className="min-h-dvh bg-[#0b0e0c] px-4 py-10 text-[#f4f5f2] sm:px-7 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/account"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-white/45 hover:text-white"
        >
          <ArrowLeft className="size-4" /> {t("back")}
        </Link>
        <header className="mt-5 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_82%_10%,rgba(231,45,69,0.2),transparent_34%),#111111] p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#e72d45]/25 bg-[#e72d45]/10 px-3 py-1.5 text-[10px] text-[#ff8b9b] uppercase">
              {t("beta")}
            </span>
            <span className="rounded-full border border-emerald-300/15 bg-emerald-300/6 px-3 py-1.5 text-[10px] text-emerald-100/65 uppercase">
              {t("ownerControlled")}
            </span>
          </div>
          <p className="mt-7 text-xs font-semibold tracking-[0.14em] text-[#ff667a] uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/45">
            {t("description")}
          </p>
        </header>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-white/6">
                  <Link2 className="size-5 text-[#ff667a]" />
                </div>
                <div>
                  <p className="text-xs text-white/30">Google</p>
                  <h2 className="mt-1 text-2xl font-medium">
                    {t("googleTitle")}
                  </h2>
                </div>
              </div>
              <span
                className={`rounded-full border px-3 py-1.5 text-[10px] uppercase ${
                  status.connected
                    ? "border-emerald-300/20 bg-emerald-300/8 text-emerald-200"
                    : "border-white/10 text-white/35"
                }`}
              >
                {status.connected ? t("connected") : t("notConnected")}
              </span>
            </div>

            {!status.configured ? (
              <div className="mt-7 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5">
                <p className="flex gap-2 text-sm text-amber-100/75">
                  <AlertTriangle className="size-4 shrink-0" />
                  {t("setupRequired")}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/35">
                  {t("setupDescription")}
                </p>
              </div>
            ) : status?.connected ? (
              <div className="mt-7">
                <div className="rounded-2xl border border-white/8 bg-black/10 p-5">
                  <p className="text-xs text-white/30">{t("connectedAs")}</p>
                  <p className="mt-1 font-medium text-white/80">
                    {status.email}
                  </p>
                  <p className="mt-3 text-xs text-white/30">
                    {status.lastSyncedAt
                      ? t("lastSync", {
                          value: new Date(status.lastSyncedAt).toLocaleString(),
                        })
                      : t("neverSynced")}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={Boolean(action)}
                    onClick={() => void sync()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {action === "sync" ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )}
                    {t("syncNow")}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(action)}
                    onClick={() => void disconnect()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/45 hover:text-white disabled:opacity-40"
                  >
                    {action === "disconnect" ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    {t("disconnect")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-7">
                <p className="text-sm leading-6 text-white/40">
                  {t("connectDescription")}
                </p>
                <a
                  href="/api/connections/google/start"
                  className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white"
                >
                  {t("connectGoogle")} <ArrowRight className="size-4" />
                </a>
              </div>
            )}
          </article>

          <aside className="space-y-5">
            <section className="rounded-[2rem] border border-white/10 bg-[#111111] p-6">
              <CalendarDays className="size-5 text-[#ff667a]" />
              <h2 className="mt-5 text-xl font-medium">{t("calendarTitle")}</h2>
              <p className="mt-2 text-sm leading-6 text-white/40">
                {t("calendarDescription")}
              </p>
              {status?.summary && (
                <p className="mt-4 text-xs text-emerald-100/60">
                  {t("calendarSummary", {
                    count: status.summary.calendarEventCount ?? 0,
                  })}
                </p>
              )}
            </section>
            <section className="rounded-[2rem] border border-white/10 bg-[#111111] p-6">
              <Mail className="size-5 text-[#ff667a]" />
              <h2 className="mt-5 text-xl font-medium">{t("mailTitle")}</h2>
              <p className="mt-2 text-sm leading-6 text-white/40">
                {t("mailDescription")}
              </p>
              {status?.summary && (
                <p className="mt-4 text-xs text-emerald-100/60">
                  {t("mailSummary", {
                    matches: status.summary.mailSignals?.length ?? 0,
                    scanned: status.summary.mailScannedCount ?? 0,
                  })}
                </p>
              )}
            </section>
          </aside>
        </section>

        {status?.summary?.mailSignals?.length ? (
          <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
            <h2 className="text-xl font-medium">{t("signalsTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-white/35">
              {t("signalsDescription")}
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {status.summary.mailSignals.map((signal) => (
                <li
                  key={`${signal.subject}-${signal.date ?? ""}`}
                  className="rounded-xl border border-white/8 bg-black/10 p-4"
                >
                  <p className="text-sm text-white/70">{signal.subject}</p>
                  {signal.date && (
                    <p className="mt-1 text-xs text-white/25">{signal.date}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-5 flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 size-5 shrink-0 text-emerald-200/70" />
            <div>
              <h2 className="text-xl font-medium">{t("privacyTitle")}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                {t("privacyDescription")}
              </p>
            </div>
          </div>
          <Link
            href="/ai"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/60 hover:text-white"
          >
            {t("openPlanner")} <ArrowRight className="size-4" />
          </Link>
        </section>

        {message && (
          <p className="mt-5 flex gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/6 p-4 text-sm text-emerald-100/70">
            <CheckCircle2 className="size-4 shrink-0" /> {message}
          </p>
        )}
        {error && (
          <p className="mt-5 flex gap-2 rounded-xl border border-red-300/15 bg-red-300/6 p-4 text-sm text-red-100/70">
            <AlertTriangle className="size-4 shrink-0" /> {error}
          </p>
        )}
      </div>
    </main>
  );
}
