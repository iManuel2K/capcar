import { NextResponse } from "next/server";

import {
  getTripPlannerStatus,
  planScenicTrip,
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
    const admin = user ? createAdminClient() : undefined;
    const aiConnection =
      user && admin ? await getAiConnection(admin, user.id) : null;
    const plannerEnvironment = aiConnection
      ? tripPlannerEnvironmentForConnection(aiConnection)
      : {
          ...process.env,
          CAPCAR_TRIP_PLANNER_MODE: "deterministic",
          OPENAI_API_KEY: undefined,
          ANTHROPIC_API_KEY: undefined,
        };
    const planner = getTripPlannerStatus(plannerEnvironment);
    if (user) {
      const guard = await guardProductApi("trip-planner", { limit: 10 });
      if (!guard.ok) return guard.response;
    }
    let context: ConnectedPlanningContext | undefined;
    if (
      input.useConnectedContext &&
      user &&
      getGoogleConnectionStatus().configured
    ) {
      const connection = await getGoogleConnection(admin!, user.id);
      if (connection?.sync_summary) {
        context = {
          busyDates: connection.sync_summary.busyDates ?? [],
          mailSignals: connection.sync_summary.mailSignals ?? [],
        };
      }
    }
    if (!user && input.inputMode === "prompt")
      return NextResponse.json(
        {
          error:
            "Sign in for natural-language AI planning, or choose exact places for a route preview.",
        },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    if (user && !aiConnection && input.inputMode === "prompt")
      return NextResponse.json(
        {
          error:
            "Connect your OpenAI or Claude API key to plan with your own AI credits.",
          code: "ai_connection_required",
        },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    const plan =
      planner.mode !== "deterministic" && !user
        ? {
            ...(await planScenicTrip(input, context, {
              ...process.env,
              CAPCAR_TRIP_PLANNER_MODE: "deterministic",
            })),
            contextNotes: [
              "Sign in to use live AI research and connected planning. This preview uses CapCar's route composer.",
            ],
          }
        : await planScenicTripWithFallback(input, context, plannerEnvironment);
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
