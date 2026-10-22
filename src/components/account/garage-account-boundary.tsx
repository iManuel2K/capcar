"use client";

import {} from "lucide-react";
import { MotionLoader as LoaderCircle } from "@/components/ui/motion-loader";
import { GarageSyncNotice, type SyncState } from "./garage-sync-notice";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  applyLocalSnapshot,
  clearLocalSnapshot,
  collectLocalSnapshot,
  garageStorageEvents,
  localSnapshotSchema,
  snapshotKeys,
} from "@/features/sync/local-snapshot";
import { decideInitialSnapshot } from "@/features/sync/snapshot-reconciliation";
import {
  markGarageChanged,
  markGarageSynced,
  readSyncMetadata,
} from "@/features/sync/sync-metadata";
import { createClient } from "@/lib/supabase/client";

export const ACTIVE_GARAGE_USER_KEY = "capcar.active-garage-user.v1";
const GarageAccountContext = createContext({ configured: false, userId: "" });
export const useGarageAccount = () => useContext(GarageAccountContext);

export function GarageAccountBoundary({
  configured,
  children,
}: {
  configured: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const allowGuest = usePathname() === "/garage/new";
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
        if (!data.user) {
          if (authError && authError.name !== "AuthSessionMissingError")
            throw authError;
          if (!cancelled) {
            setReady(true);
            if (!allowGuest)
              router.replace(
                `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
              );
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
  }, [configured, router, upload, allowGuest]);

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
      if (event.key && !snapshotKeys.some((key) => key === event.key)) return;
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
          <LoaderCircle className="mx-auto size-7" />
          <p className="text-muted-foreground mt-4 text-sm">
            Loading your garage…
          </p>
        </div>
      </div>
    );
  }

  return (
    <GarageAccountContext.Provider value={{ configured, userId }}>
      {configured && userId && (
        <GarageSyncNotice
          key={syncState}
          state={syncState}
          error={error}
          onRetry={() => void upload(userId)}
        />
      )}
      {!configured || userId || (allowGuest && !error) ? (
        children
      ) : (
        <p role="alert" className="p-6 text-white/70">
          {error || "Please sign in to open your private garage."}
        </p>
      )}
    </GarageAccountContext.Provider>
  );
}
