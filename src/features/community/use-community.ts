"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthStatus } from "@/features/auth/auth-config";
import type { actions, CommunityData } from "./contracts";
export function useCommunity() {
  const [data, setData] = useState<CommunityData>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const mutationLock = useRef(false);
  const identityGeneration = useRef(0);
  const invalidateRequests = useCallback(() => {
    generation.current++;
  }, []);
  const refresh = useCallback((signal?: AbortSignal) => {
    const requestGeneration = ++generation.current;
    return fetch("/api/community", {
      cache: "no-store",
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(15_000)])
        : AbortSignal.timeout(15_000),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Unable to load community data.");
        return result;
      })
      .then((result) => {
        if (!signal?.aborted && requestGeneration === generation.current) {
          setData(result);
          setError("");
        }
      })
      .catch((error) => {
        if (!signal?.aborted && requestGeneration === generation.current) {
          setData(undefined);
          setError(
            error instanceof Error ? error.message : "Connection failed.",
          );
        }
      });
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);
  useEffect(() => {
    if (!getAuthStatus().configured) return;
    const client = createClient();
    const { data: subscription } = client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        identityGeneration.current++;
        generation.current++;
        setData(undefined);
        setError("Sign in to view your community records.");
      }
      if (event === "SIGNED_IN") {
        identityGeneration.current++;
        generation.current++;
        setData(undefined);
        void refresh();
      }
    });
    return () => {
      invalidateRequests();
      subscription.subscription.unsubscribe();
    };
  }, [refresh, invalidateRequests]);
  async function mutate(
    action: keyof typeof actions,
    fields: unknown,
    id?: string,
  ) {
    if (mutationLock.current) return false;
    mutationLock.current = true;
    const identity = identityGeneration.current;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, data: fields }),
        signal: AbortSignal.timeout(15_000),
      });
      const result = await response.json();
      if (identity !== identityGeneration.current) return false;
      if (!response.ok) throw new Error(result.error || "Unable to save.");
      await refresh();
      return true;
    } catch (error) {
      if (identity === identityGeneration.current)
        setError(error instanceof Error ? error.message : "Connection failed.");
      return false;
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  }
  return { data, error, busy, refresh, mutate };
}
