"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Cloud,
  CloudOff,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

export type SyncState =
  "loading" | "synced" | "saving" | "unsaved" | "offline" | "error";
const statusCopy: Record<SyncState, string> = {
  loading: "Loading your garage…",
  synced: "Garage synced",
  saving: "Saving changes…",
  unsaved: "Changes waiting to sync",
  offline: "Offline · changes stay on this device",
  error: "Cloud sync needs attention",
};

/** The boundary keys this notice by state so each successful save gets three seconds. */
export function GarageSyncNotice({
  state,
  error,
  onRetry,
}: {
  state: SyncState;
  error: string;
  onRetry: () => void;
}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (state !== "synced") return;
    const timer = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, [state]);
  if (state === "synced" && !visible) return null;
  const Icon =
    state === "saving" || state === "loading"
      ? LoaderCircle
      : state === "synced"
        ? CheckCircle2
        : state === "offline"
          ? CloudOff
          : Cloud;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`mx-auto mb-4 flex max-w-7xl items-center gap-2 rounded-xl border px-4 py-3 text-xs ${state === "error" ? "border-red-300/30 bg-red-300/6 text-red-100" : state === "offline" || state === "unsaved" ? "border-amber-300/30 bg-amber-300/6 text-amber-100" : state === "synced" ? "border-emerald-300/25 bg-emerald-300/5 text-emerald-100" : "border-white/15 bg-white/[0.025] text-white/70"}`}
    >
      <Icon
        aria-hidden="true"
        className={`size-4 shrink-0 ${state === "saving" || state === "loading" ? "motion-safe:animate-spin" : ""}`}
      />
      <span>{statusCopy[state]}</span>
      {error && <span className="truncate">· {error}</span>}
      {(state === "error" || state === "unsaved") && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-auto inline-flex min-h-11 shrink-0 items-center gap-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <RefreshCw aria-hidden="true" className="size-3.5" /> Retry
        </button>
      )}
    </div>
  );
}
