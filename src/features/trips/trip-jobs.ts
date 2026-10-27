import {
  createHash,
  createHmac,
  timingSafeEqual,
  randomUUID,
} from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAiConnectionEncryptionKey } from "@/features/connections/ai-connection";
import type {
  ConnectedPlanningContext,
  TripPlannerRequest,
} from "./trip-planner";

export const TRIP_JOB_TIMEOUT_MS = 180_000;
export const tripJobCutoff = () =>
  new Date(Date.now() - TRIP_JOB_TIMEOUT_MS).toISOString();

export async function expireTripJob(
  admin: SupabaseClient,
  id: string,
  userId?: string,
) {
  let query = admin
    .from("trip_planning_jobs")
    .update({
      status: "failed",
      input: null,
      context: null,
      error: "The AI provider did not finish this trip. Please try again.",
      error_code: "job_timeout",
    })
    .eq("id", id)
    .in("status", ["queued", "running"])
    .lte("created_at", tripJobCutoff());
  if (userId) query = query.eq("user_id", userId);
  const { error } = await query.abortSignal(AbortSignal.timeout(5000));
  if (error) throw error;
}

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

export class TripJobConflictError extends Error {
  constructor() {
    super("This trip request could not be resumed. Start a new trip request.");
  }
}

function requestHash(input: TripPlannerRequest) {
  return createHash("sha256")
    .update(
      JSON.stringify(
        Object.fromEntries(
          Object.entries(input).sort(([a], [b]) => a.localeCompare(b)),
        ),
      ),
    )
    .digest("hex");
}

export async function findTripJobForRequest(
  admin: SupabaseClient,
  id: string,
  userId: string,
  input: TripPlannerRequest,
) {
  const { data, error } = await admin
    .from("trip_planning_jobs")
    .select("request_hash")
    .eq("id", id)
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .abortSignal(AbortSignal.timeout(5000))
    .maybeSingle();
  if (error) throw error;
  if (!data) return false;
  if (data.request_hash !== requestHash(input))
    throw new TripJobConflictError();
  return true;
}

async function dispatchTripJob(
  admin: SupabaseClient,
  id: string,
  userId: string,
  origin: string,
) {
  try {
    // A short dispatch lease prevents every status poll from invoking the worker.
    const { data, error } = await admin
      .from("trip_planning_jobs")
      .update({ dispatched_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .eq("status", "queued")
      .gt("created_at", tripJobCutoff())
      .or(
        `dispatched_at.is.null,dispatched_at.lt.${new Date(Date.now() - 15000).toISOString()}`,
      )
      .select("id")
      .abortSignal(AbortSignal.timeout(5000))
      .maybeSingle();
    if (error) throw error;
    if (!data) return;
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
    if (response.status !== 202) {
      const rejected = await admin
        .from("trip_planning_jobs")
        .update({
          status: "failed",
          input: null,
          context: null,
          error: "The background planner could not start. Please try again.",
          error_code: "dispatch_failed",
        })
        .eq("id", id)
        .eq("user_id", userId)
        .eq("status", "queued")
        .abortSignal(AbortSignal.timeout(5000));
      if (rejected.error) throw rejected.error;
    }
  } catch {
    // A missing acknowledgement does not mean the worker failed to start.
    console.warn("Trip job dispatch deferred; status polling will retry", {
      jobId: id,
    });
  }
}

export async function startTripJob(
  admin: SupabaseClient,
  userId: string,
  input: TripPlannerRequest,
  context: ConnectedPlanningContext | undefined,
  origin: string,
  id: string = randomUUID(),
) {
  // Short-lived private jobs only; no provider keys are stored in the payload.
  const cleanup = await admin
    .from("trip_planning_jobs")
    .delete()
    .lt("expires_at", new Date().toISOString())
    .abortSignal(AbortSignal.timeout(5000));
  if (cleanup.error) console.warn("Expired trip jobs could not be cleaned up");
  const { error } = await admin
    .from("trip_planning_jobs")
    .insert({
      id,
      user_id: userId,
      input,
      context: context ?? null,
      request_hash: requestHash(input),
    })
    .abortSignal(AbortSignal.timeout(5000));
  if (error) {
    if (error.code !== "23505") throw error;
    if (!(await findTripJobForRequest(admin, id, userId, input)))
      throw new TripJobConflictError();
  }
  await dispatchTripJob(admin, id, userId, origin);
  return id;
}

export async function getTripJob(
  admin: SupabaseClient,
  id: string,
  userId: string,
  origin?: string,
) {
  const read = () =>
    admin
      .from("trip_planning_jobs")
      .select("status,result,error,error_code,created_at")
      .eq("id", id)
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString())
      .abortSignal(AbortSignal.timeout(5000))
      .maybeSingle();
  let { data, error } = await read();
  if (error) throw error;
  if (!data) return null;
  if (
    ["queued", "running"].includes(data.status) &&
    Date.now() - Date.parse(data.created_at) >= TRIP_JOB_TIMEOUT_MS
  ) {
    await expireTripJob(admin, id, userId);
    // Completion may have won the conditional update; return the actual stored state.
    ({ data, error } = await read());
    if (error) throw error;
  }
  if (data?.status === "queued" && origin)
    await dispatchTripJob(admin, id, userId, origin);
  return data;
}
