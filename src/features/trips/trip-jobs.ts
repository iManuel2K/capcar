import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAiConnectionEncryptionKey } from "@/features/connections/ai-connection";
import type {
  ConnectedPlanningContext,
  TripPlannerRequest,
} from "./trip-planner";

export function signTripJob(id: string) {
  return createHmac("sha256", getAiConnectionEncryptionKey())
    .update(`trip-job:${id}`)
    .digest("hex");
}
export function verifyTripJob(id: unknown, signature: unknown): id is string {
  if (
    typeof id !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(id) ||
    typeof signature !== "string" ||
    !/^[a-f0-9]{64}$/i.test(signature)
  )
    return false;
  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(signTripJob(id), "hex"),
  );
}

export async function startTripJob(
  admin: SupabaseClient,
  userId: string,
  input: TripPlannerRequest,
  context: ConnectedPlanningContext | undefined,
  origin: string,
) {
  const id = randomUUID();
  // Short-lived private jobs only; no provider keys are stored in the payload.
  const cleanup = await admin
    .from("trip_planning_jobs")
    .delete()
    .lt("expires_at", new Date().toISOString());
  if (cleanup.error) throw cleanup.error;
  const { error } = await admin
    .from("trip_planning_jobs")
    .insert({ id, user_id: userId, input, context: context ?? null });
  if (error) throw error;
  let rejected = false;
  try {
    const target = new URL(
      "/.netlify/functions/trip-plan-background",
      process.env.DEPLOY_URL || origin,
    );
    const response = await fetch(target, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, signature: signTripJob(id) }),
      signal: AbortSignal.timeout(8000),
    });
    rejected = response.status !== 202;
  } catch {
    // A missing acknowledgement does not prove dispatch failed. The worker may
    // already be running (and charging the provider). Keep polling this job;
    // never encourage another paid submission on an ambiguous network failure.
    return id;
  }
  if (rejected) {
    await admin
      .from("trip_planning_jobs")
      .update({
        status: "failed",
        input: null,
        context: null,
        error: "The background planner could not start. Please try again.",
        error_code: "dispatch_failed",
      })
      .eq("id", id)
      .eq("status", "queued");
  }
  return id;
}

export async function getTripJob(
  admin: SupabaseClient,
  id: string,
  userId: string,
) {
  const { data, error } = await admin
    .from("trip_planning_jobs")
    .select("status,result,error,error_code,created_at")
    .eq("id", id)
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (
    ["queued", "running"].includes(data.status) &&
    Date.now() - Date.parse(data.created_at) > 180000
  )
    return {
      status: "failed",
      error: "The AI provider did not finish this trip. Please try again.",
      error_code: "job_timeout",
    };
  return data;
}
