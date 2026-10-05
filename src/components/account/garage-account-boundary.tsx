"use client";

import {
  CheckCircle2,
  Cloud,
  CloudOff,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  applyLocalSnapshot,
  clearLocalSnapshot,
  collectLocalSnapshot,
  garageStorageEvents,
  localSnapshotSchema,
} from "@/features/sync/local-snapshot";
import { decideInitialSnapshot } from "@/features/sync/snapshot-reconciliation";
import {
  markGarageChanged,
  markGarageSynced,
  readSyncMetadata,
} from "@/features/sync/sync-metadata";
import { createClient } from "@/lib/supabase/client";

export const ACTIVE_GARAGE_USER_KEY = "capcar.active-garage-user.v1";

type SyncState =
  "loading" | "synced" | "saving" | "unsaved" | "offline" | "error";

const statusCopy: Record<SyncState, string> = {
  loading: "Loading your garage…",
  synced: "Garage synced",
  saving: "Saving changes…",
  unsaved: "Changes waiting to sync",
  offline: "Offline · changes stay on this device",
  error: "Cloud sync needs attention",
};

export function GarageAccountBoundary({
  configured,
  children,
}: {
  configured: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(!configured);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [syncState, setSyncState] = useState<SyncState>(
    configured ? "loading" : "offline",
  );
  const lastPayload = useRef("");
  const applyingSnapshot = useRef(false);
  const uploadTimer = useRef<number | undefined>(undefined);

  const upload = useCallback(async (activeUserId: string) => {
    if (!navigator.onLine) {
      setSyncState("offline");
      return false;
    }

    const snapshot = collectLocalSnapshot(window.localStorage);
    const serialized = JSON.stringify(snapshot.data);
    if (serialized === lastPayload.current) {
      setSyncState("synced");
      return true;
    }

    setSyncState("saving");
    const syncedAt = new Date().toISOString();
    const { error: uploadError } = await createClient()
      .from("garage_snapshots")
      .upsert({
        user_id: activeUserId,
        payload: snapshot,
        updated_at: syncedAt,
      });

    if (uploadError) {
      setError(uploadError.message);
      setSyncState("error");
      return false;
    }

    lastPayload.current = serialized;
    markGarageSynced(activeUserId, window.localStorage, syncedAt);
    setError("");
    setSyncState("synced");
    return true;
  }, []);

  useEffect(() => {
    if (!configured) return;

    let cancelled = false;

    async function initialize() {
      try {
        const client = createClient();
        const { data, error: authError } = await client.auth.getUser();
        if (authError) throw authError;
        if (!data.user) {
          if (!cancelled) {
            setReady(true);
            router.replace("/login?next=/garage");
          }
          return;
        }

        const activeUserId = data.user.id;
        const previousUserId = window.localStorage.getItem(
          ACTIVE_GARAGE_USER_KEY,
        );
        const local = collectLocalSnapshot(window.localStorage);
        const metadata = readSyncMetadata(window.localStorage);
        const { data: remoteRow, error: downloadError } = await client
          .from("garage_snapshots")
          .select("payload, updated_at")
          .eq("user_id", activeUserId)
          .maybeSingle();
        if (downloadError) throw downloadError;

        const parsedRemote = remoteRow?.payload
          ? localSnapshotSchema.safeParse(remoteRow.payload)
          : undefined;
        if (parsedRemote && !parsedRemote.success) {
          throw new Error(
            "The cloud snapshot could not be validated. Your device data was left unchanged.",
          );
        }

        const remote = parsedRemote?.success ? parsedRemote.data : undefined;
        const decision = decideInitialSnapshot({
          currentUserId: activeUserId,
          previousUserId,
          local,
          remote,
          localChangedAt:
            metadata && metadata.userId === activeUserId
              ? metadata.changedAt
              : undefined,
          remoteUpdatedAt: remoteRow?.updated_at,
        });

        applyingSnapshot.current = true;
        if (decision === "use-remote" && remote) {
          clearLocalSnapshot(window.localStorage);
          applyLocalSnapshot(remote, window.localStorage);
          lastPayload.current = JSON.stringify(remote.data);
          markGarageSynced(
            activeUserId,
            window.localStorage,
            remoteRow?.updated_at ?? remote.capturedAt,
          );
        } else if (decision === "empty") {
          clearLocalSnapshot(window.localStorage);
          lastPayload.current = JSON.stringify({});
          markGarageSynced(activeUserId, window.localStorage);
        }
        applyingSnapshot.current = false;

        window.localStorage.setItem(ACTIVE_GARAGE_USER_KEY, activeUserId);
        if (!cancelled) {
          setUserId(activeUserId);
          setReady(true);
          setSyncState(decision === "use-local" ? "unsaved" : "synced");
        }

        if (decision === "use-local") await upload(activeUserId);
      } catch (caught) {
        applyingSnapshot.current = false;
        if (!cancelled) {
          setError(
            caught instanceof Error ? caught.message : "Garage sync failed.",
          );
          setSyncState("error");
          setReady(true);
        }
      }
    }

    void initialize();
    return () => {
      cancelled = true;
    };
  }, [configured, router, upload]);

  useEffect(() => {
    if (!configured || !ready || !userId) return;

    function scheduleUpload() {
      if (applyingSnapshot.current) return;
      markGarageChanged(userId, window.localStorage);
      setSyncState(navigator.onLine ? "unsaved" : "offline");
      if (uploadTimer.current) window.clearTimeout(uploadTimer.current);
      uploadTimer.current = window.setTimeout(() => void upload(userId), 800);
    }

    function handleStorage(event: StorageEvent) {
      if (event.key && !event.key.startsWith("capcar.")) return;
      scheduleUpload();
    }

    function flushWhenHidden() {
      if (document.visibilityState === "hidden") void upload(userId);
    }

    function handleOnline() {
      void upload(userId);
    }

    function handleOffline() {
      setSyncState("offline");
    }

    garageStorageEvents.forEach((eventName) =>
      window.addEventListener(eventName, scheduleUpload),
    );
    window.addEventListener("storage", handleStorage);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("pagehide", flushWhenHidden);
    document.addEventListener("visibilitychange", flushWhenHidden);

    return () => {
      if (uploadTimer.current) window.clearTimeout(uploadTimer.current);
      garageStorageEvents.forEach((eventName) =>
        window.removeEventListener(eventName, scheduleUpload),
      );
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("pagehide", flushWhenHidden);
      document.removeEventListener("visibilitychange", flushWhenHidden);
    };
  }, [configured, ready, upload, userId]);

  if (!ready) {
    return (
      <div className="grid min-h-[60dvh] place-items-center text-center">
        <div>
          <LoaderCircle className="mx-auto size-7 animate-spin text-[#ff667a]" />
          <p className="mt-4 text-sm text-white/45">Loading your garage…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {configured && (
        <div
          aria-live="polite"
          className={`mx-auto mb-4 flex max-w-7xl items-center gap-2 rounded-xl border px-4 py-3 text-xs ${syncState === "error" ? "border-red-300/15 bg-red-300/6 text-red-100/70" : syncState === "offline" || syncState === "unsaved" ? "border-amber-300/15 bg-amber-300/6 text-amber-100/70" : "border-white/8 bg-white/[0.025] text-white/40"}`}
        >
          <SyncIcon state={syncState} />
          <span>{statusCopy[syncState]}</span>
          {error && <span className="truncate">· {error}</span>}
          {(syncState === "error" || syncState === "unsaved") && userId && (
            <button
              type="button"
              onClick={() => void upload(userId)}
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 font-medium text-white/70"
            >
              <RefreshCw className="size-3.5" /> Retry
            </button>
          )}
        </div>
      )}
      {children}
    </>
  );
}

function SyncIcon({ state }: { state: SyncState }) {
  if (state === "saving" || state === "loading") {
    return <LoaderCircle className="size-4 shrink-0 animate-spin" />;
  }
  if (state === "synced") {
    return <CheckCircle2 className="size-4 shrink-0" />;
  }
  if (state === "offline") {
    return <CloudOff className="size-4 shrink-0" />;
  }
  return <Cloud className="size-4 shrink-0" />;
}
