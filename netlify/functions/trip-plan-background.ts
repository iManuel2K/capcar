import { createAdminClient } from "../../src/lib/supabase/admin";
import {
  getAiConnection,
  tripPlannerEnvironmentForConnection,
  getAiConnectionEncryptionKey,
} from "../../src/features/connections/ai-connection";
import { verifyTripJob } from "../../src/features/trips/trip-jobs";
import {
  planScenicTripWithFallback,
  tripPlannerRequestSchema,
  TripPlannerServiceError,
  type ConnectedPlanningContext,
} from "../../src/features/trips/trip-planner";

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
    .gt("expires_at", new Date().toISOString())
    .select("id,user_id,input,context")
    .maybeSingle();
  if (error) throw error;
  if (!job) return new Response(null, { status: 202 });
  try {
    const input = tripPlannerRequestSchema.parse(job.input);
    const connection = await getAiConnection(admin, job.user_id);
    if (!connection)
      throw new Error("Reconnect your AI provider before planning.");
    const environment = {
      ...tripPlannerEnvironmentForConnection(connection),
      CAPCAR_TRIP_PLANNER_TIMEOUT_MS: "120000",
    };
    const plan = await planScenicTripWithFallback(
      input,
      job.context as ConnectedPlanningContext | undefined,
      environment,
      AbortSignal.timeout(125000),
    );
    const saved = await admin
      .from("trip_planning_jobs")
      .update({ status: "completed", result: plan, input: null, context: null })
      .eq("id", job.id)
      .eq("status", "running");
    if (saved.error) throw saved.error;
    console.info("Trip planning job completed", { jobId: job.id });
  } catch (error) {
    const message =
      error instanceof TripPlannerServiceError
        ? error.message
        : "Trip planning failed. Check your AI connection and try again.";
    const saved = await admin
      .from("trip_planning_jobs")
      .update({
        status: "failed",
        input: null,
        context: null,
        error: message,
        error_code:
          error instanceof TripPlannerServiceError
            ? error.code
            : "planning_failed",
      })
      .eq("id", job.id)
      .eq("status", "running");
    if (saved.error) throw saved.error;
    console.error("Trip planning job failed", {
      jobId: job.id,
      error: message,
    });
  }
  return new Response(null, { status: 202 });
}
