import { createAdminClient } from "../../src/lib/supabase/admin";
import {
  getAiConnection,
  tripPlannerEnvironmentForConnection,
  getAiConnectionEncryptionKey,
} from "../../src/features/connections/ai-connection";
import {
  expireTripJob,
  tripJobCutoff,
  TRIP_JOB_TIMEOUT_MS,
  verifyTripJob,
} from "../../src/features/trips/trip-jobs";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  planScenicTripWithFallback,
  tripPlannerRequestSchema,
  TripPlannerServiceError,
  type ConnectedPlanningContext,
  type TripPlan,
} from "../../src/features/trips/trip-planner";

type TripJobOutcome =
  | { status: "completed"; result: TripPlan }
  | { status: "failed"; error: string; error_code: string };

async function saveOutcome(
  admin: SupabaseClient,
  id: string,
  outcome: TripJobOutcome,
) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const saved = await admin
        .from("trip_planning_jobs")
        .update({ ...outcome, input: null, context: null })
        .eq("id", id)
        .eq("status", "running")
        .gt("created_at", tripJobCutoff())
        .select("id")
        .abortSignal(AbortSignal.timeout(5000))
        .maybeSingle();
      if (saved.error) throw saved.error;
      if (!saved.data) await expireTripJob(admin, id);
      return Boolean(saved.data);
    } catch (error) {
      lastError = error;
      if (attempt < 2)
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1)),
        );
    }
  }
  throw lastError;
}

// The suffix enables Netlify background invocation (immediate 202, separate execution).
export default async function tripPlanBackground(request: Request) {
  // Safe operational probe: validate bindings without reading users or calling an AI.
  if (request.method === "GET") {
    try {
      const admin = createAdminClient();
      getAiConnectionEncryptionKey();
      const probe = new URL(request.url).searchParams.get("probe");
      if (probe && /^[a-f0-9-]{36}$/i.test(probe)) {
        // Only an admin-created, explicitly marked readiness fixture can be updated.
        // This branch never loads a user or calls an AI provider.
        const checked = await admin
          .from("trip_planning_jobs")
          .update({
            status: "completed",
            result: { worker_ready: true },
            input: null,
          })
          .eq("id", probe)
          .eq("status", "queued")
          .contains("input", { kind: "worker-readiness-probe" });
        if (checked.error) throw checked.error;
      }
      console.info("Trip planner background worker configuration ready");
    } catch {
      console.error("Trip planner background worker configuration missing");
    }
    return new Response(null, { status: 202 });
  }
  const body = await request.json().catch(() => null);
  if (!body || !verifyTripJob(body.id, body.signature))
    return new Response(null, { status: 403 });
  const admin = createAdminClient();
  // Atomic claim prevents Netlify delivery retries from charging the provider twice.
  const { data: job, error } = await admin
    .from("trip_planning_jobs")
    .update({ status: "running" })
    .eq("id", body.id)
    .eq("status", "queued")
    .gt("created_at", tripJobCutoff())
    .gt("expires_at", new Date().toISOString())
    .select("id,user_id,input,context,created_at")
    .abortSignal(AbortSignal.timeout(5000))
    .maybeSingle();
  if (error) throw error;
  if (!job) {
    // Delivery retries reconcile crashed jobs without repeating an unknown paid call.
    await expireTripJob(admin, body.id);
    return new Response(null, { status: 202 });
  }
  let outcome: TripJobOutcome;
  try {
    const input = tripPlannerRequestSchema.parse(job.input);
    const connection = await getAiConnection(admin, job.user_id);
    if (!connection)
      throw new Error("Reconnect your AI provider before planning.");
    const environment = {
      ...tripPlannerEnvironmentForConnection(connection),
      CAPCAR_TRIP_PLANNER_TIMEOUT_MS: "120000",
    };
    const remaining =
      Date.parse(job.created_at) + TRIP_JOB_TIMEOUT_MS - Date.now();
    if (remaining <= 15_000) {
      outcome = {
        status: "failed",
        error: "The AI provider did not finish this trip. Please try again.",
        error_code: "job_timeout",
      };
    } else {
      const plan = await planScenicTripWithFallback(
        input,
        job.context as ConnectedPlanningContext | undefined,
        environment,
        AbortSignal.timeout(Math.min(125000, remaining - 15_000)),
      );
      outcome = { status: "completed", result: plan };
    }
  } catch (error) {
    const message =
      error instanceof TripPlannerServiceError
        ? error.message
        : "Trip planning failed. Check your AI connection and try again.";
    outcome = {
      status: "failed",
      error: message,
      error_code:
        error instanceof TripPlannerServiceError
          ? error.code
          : "planning_failed",
    };
  }
  // Persistence errors must never be mistaken for provider failures or lose the plan.
  const saved = await saveOutcome(admin, job.id, outcome);
  console.info("Trip planning job finalized", {
    jobId: job.id,
    status: saved ? outcome.status : "already_terminal_or_expired",
  });
  return new Response(null, { status: 202 });
}
