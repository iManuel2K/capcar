"use client";

import { Cloud, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  applyLocalSnapshot,
  clearLocalSnapshot,
  collectLocalSnapshot,
  type LocalSnapshot,
} from "@/features/sync/local-snapshot";
import { createClient } from "@/lib/supabase/client";

export const ACTIVE_GARAGE_USER_KEY = "capcar.active-garage-user.v1";

function hasSnapshotData(snapshot: LocalSnapshot) {
  return Object.keys(snapshot.data).length > 0;
}

export function GarageAccountBoundary({
  configured,
  children,
}: {
  configured: boolean;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(!configured);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!configured) return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let lastPayload = "";
    const client = createClient();

    async function upload(userId: string) {
      const snapshot = collectLocalSnapshot(window.localStorage);
      const serialized = JSON.stringify(snapshot.data);
      if (serialized === lastPayload) return;
      const { error: uploadError } = await client
        .from("garage_snapshots")
        .upsert({
          user_id: userId,
          payload: snapshot,
          updated_at: new Date().toISOString(),
        });
      if (uploadError) throw uploadError;
      lastPayload = serialized;
    }

    async function initialize() {
      try {
        const { data, error: authError } = await client.auth.getUser();
        if (authError) throw authError;
        if (!data.user) return;

        const previousUser = window.localStorage.getItem(
          ACTIVE_GARAGE_USER_KEY,
        );
        const localSnapshot = collectLocalSnapshot(window.localStorage);

        const { data: remote, error: downloadError } = await client
          .from("garage_snapshots")
          .select("payload")
          .eq("user_id", data.user.id)
          .maybeSingle();
        if (downloadError) throw downloadError;

        if (remote?.payload) {
          clearLocalSnapshot(window.localStorage);
          applyLocalSnapshot(remote.payload, window.localStorage);
        } else if (!previousUser && hasSnapshotData(localSnapshot)) {
          await upload(data.user.id);
        } else if (previousUser !== data.user.id) {
          clearLocalSnapshot(window.localStorage);
        }

        window.localStorage.setItem(ACTIVE_GARAGE_USER_KEY, data.user.id);
        lastPayload = JSON.stringify(
          collectLocalSnapshot(window.localStorage).data,
        );
        if (!cancelled) setReady(true);

        timer = setInterval(() => {
          void upload(data.user.id).catch((caught: unknown) => {
            if (!cancelled)
              setError(
                caught instanceof Error ? caught.message : "Garage sync failed.",
              );
          });
        }, 4000);
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error ? caught.message : "Garage sync failed.",
          );
          setReady(true);
        }
      }
    }

    void initialize();
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [configured]);

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
      {error && (
        <div className="mx-auto mb-4 flex max-w-7xl items-center gap-2 rounded-xl border border-amber-300/15 bg-amber-300/6 px-4 py-3 text-xs text-amber-100/70">
          <Cloud className="size-4 shrink-0" /> Your garage is available on
          this device, but cloud sync needs attention: {error}
        </div>
      )}
      {children}
    </>
  );
}
