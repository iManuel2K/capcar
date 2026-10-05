import { NextResponse } from "next/server";

import {
  planScenicTripWithFallback,
  TripPlannerServiceError,
  tripPlannerRequestSchema,
  type ConnectedPlanningContext,
} from "@/features/trips/trip-planner";
import { getGoogleConnectionStatus } from "@/features/connections/google-connection";
import { getGoogleConnection } from "@/features/connections/google-store";
import {
  getAiConnection,
  tripPlannerEnvironmentForConnection,
} from "@/features/connections/ai-connection";
import {
  guardProductApi,
  isSameOriginRequest,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentUser } from "@/lib/supabase/current-user";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  try {
    const input = await readJsonRequest(request, tripPlannerRequestSchema);
    const user = await currentUser();
    if (!user)
      return NextResponse.json(
        { error: "Sign in to use CapCar AI.", code: "account_required" },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    const admin = createAdminClient();
    const aiConnection = await getAiConnection(admin, user.id);
    if (!aiConnection)
      return NextResponse.json(
        {
          error:
            "Connect your Gemini, OpenAI or Claude API key before using CapCar AI.",
          code: "ai_connection_required",
        },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    const plannerEnvironment = aiConnection
      ? tripPlannerEnvironmentForConnection(aiConnection)
      : {
          ...process.env,
          CAPCAR_TRIP_PLANNER_MODE: "deterministic",
          GEMINI_API_KEY: undefined,
          OPENAI_API_KEY: undefined,
          ANTHROPIC_API_KEY: undefined,
        };
    const guard = await guardProductApi("trip-planner", { limit: 10 });
    if (!guard.ok) return guard.response;
    let context: ConnectedPlanningContext | undefined;
    if (input.useConnectedContext && getGoogleConnectionStatus().configured) {
      const connection = await getGoogleConnection(admin!, user.id);
      if (connection?.sync_summary) {
        context = {
          busyDates: connection.sync_summary.busyDates ?? [],
          mailSignals: connection.sync_summary.mailSignals ?? [],
        };
      }
    }
    const plan = await planScenicTripWithFallback(
      input,
      context,
      plannerEnvironment,
    );
    return NextResponse.json(plan, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Trip planning request failed", error);
    if (error instanceof TripPlannerServiceError)
      return NextResponse.json(
        { error: error.message, code: error.code },
        {
          status: error.status,
          headers: { "Cache-Control": "no-store" },
        },
      );
    return productApiError(error, "Trip planning request failed.");
  }
}
