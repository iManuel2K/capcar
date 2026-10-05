"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  KeyRound,
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

export type AiConnectionStatus = {
  configured: boolean;
  connected: boolean;
  provider?: "openai" | "anthropic";
  keyHint?: string;
  model?: string;
  verifiedAt?: string;
};

export function ConnectionWorkspace({
  connectionResult,
  initialAiStatus,
  initialStatus,
}: {
  connectionResult?: string;
  initialAiStatus: AiConnectionStatus;
  initialStatus: ConnectionStatus;
}) {
  const t = useTranslations("Connections");
  const [status, setStatus] = useState(initialStatus);
  const [aiStatus, setAiStatus] = useState(initialAiStatus);
  const [aiProvider, setAiProvider] = useState<"openai" | "anthropic">(
    initialAiStatus.provider ?? "openai",
  );
  const [apiKey, setApiKey] = useState("");
  const [aiAction, setAiAction] = useState<"connect" | "disconnect">();
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

  async function connectAi() {
    if (!apiKey.trim()) return;
    setAiAction("connect");
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/connections/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: aiProvider, apiKey: apiKey.trim() }),
      });
      const body = (await response.json()) as AiConnectionStatus & {
        error?: string;
      };
      if (!response.ok) throw new Error(body.error || t("errors.aiConnect"));
      setAiStatus(body);
      setApiKey("");
      setMessage(t("aiConnectedMessage"));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("errors.aiConnect"),
      );
    } finally {
      setAiAction(undefined);
    }
  }

  async function disconnectAi() {
    if (!window.confirm(t("aiDisconnectConfirm"))) return;
    setAiAction("disconnect");
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/connections/ai", {
        method: "DELETE",
      });
      const body = (await response.json()) as AiConnectionStatus & {
        error?: string;
      };
      if (!response.ok) throw new Error(body.error || t("errors.aiDisconnect"));
      setAiStatus(body);
      setMessage(t("aiDisconnectedMessage"));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("errors.aiDisconnect"),
      );
    } finally {
      setAiAction(undefined);
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

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-[#e72d45]/12">
                <Bot className="size-5 text-[#ff667a]" />
              </div>
              <div>
                <p className="text-xs text-white/30">{t("aiEyebrow")}</p>
                <h2 className="mt-1 text-2xl font-medium">{t("aiTitle")}</h2>
              </div>
            </div>
            <span
              className={
                aiStatus.connected
                  ? "rounded-full border border-emerald-300/20 bg-emerald-300/8 px-3 py-1.5 text-[10px] text-emerald-200 uppercase"
                  : "rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/35 uppercase"
              }
            >
              {aiStatus.connected ? t("connected") : t("notConnected")}
            </span>
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-6 text-white/40">
            {t("aiDescription")}
          </p>

          {!aiStatus.configured ? (
            <div className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5 text-sm text-amber-100/75">
              <p className="flex gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                {t("aiSetupRequired")}
              </p>
            </div>
          ) : aiStatus.connected ? (
            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="rounded-2xl border border-white/8 bg-black/10 p-5">
                <p className="text-xs text-white/30">{t("aiConnectedWith")}</p>
                <p className="mt-1 font-medium text-white/80">
                  {aiStatus.provider === "anthropic"
                    ? t("providerClaude")
                    : t("providerOpenAi")}
                  {aiStatus.keyHint ? (
                    <span className="text-white/40"> · {aiStatus.keyHint}</span>
                  ) : null}
                </p>
                <p className="mt-2 text-xs text-white/30">
                  {t("aiUsesCredits")}
                </p>
              </div>
              <button
                type="button"
                disabled={Boolean(aiAction)}
                onClick={() => void disconnectAi()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/45 hover:text-white disabled:opacity-40"
              >
                {aiAction === "disconnect" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                {t("disconnect")}
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-xs text-white/35">{t("chooseProvider")}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["openai", "anthropic"] as const).map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      aria-pressed={aiProvider === provider}
                      onClick={() => setAiProvider(provider)}
                      className={
                        aiProvider === provider
                          ? "min-h-12 rounded-xl border border-[#e72d45]/55 bg-[#e72d45]/12 px-4 text-sm text-white transition"
                          : "min-h-12 rounded-xl border border-white/10 px-4 text-sm text-white/40 transition hover:text-white"
                      }
                    >
                      {provider === "openai"
                        ? t("providerOpenAi")
                        : t("providerClaude")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="ai-api-key" className="text-xs text-white/35">
                  {t("apiKey")}
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <KeyRound className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/25" />
                    <input
                      id="ai-api-key"
                      type="password"
                      value={apiKey}
                      onChange={(event) => setApiKey(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void connectAi();
                      }}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={t("apiKeyPlaceholder")}
                      className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 pr-4 pl-11 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#e72d45]/55"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={Boolean(aiAction) || apiKey.trim().length < 20}
                    onClick={() => void connectAi()}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {aiAction === "connect" ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                    {t("connectAi")}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/30">
                  <span>{t("aiPrivate")}</span>
                  <a
                    href={
                      aiProvider === "openai"
                        ? "https://platform.openai.com/api-keys"
                        : "https://console.anthropic.com/settings/keys"
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#ff8b9b] hover:text-white"
                  >
                    {t("getApiKey")} →
                  </a>
                </div>
              </div>
            </div>
          )}
        </section>

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
