import { NextResponse } from "next/server";

import {
  getTripPlannerStatus,
  planScenicTrip,
  planScenicTripWithFallback,
  tripPlannerRequestSchema,
  type ConnectedPlanningContext,
} from "@/features/trips/trip-planner";
import { getGoogleConnectionStatus } from "@/features/connections/google-connection";
import { getGoogleConnection } from "@/features/connections/google-store";
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
    const planner = getTripPlannerStatus();
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
      const connection = await getGoogleConnection(
        createAdminClient(),
        user.id,
      );
      if (connection?.sync_summary) {
        context = {
          busyDates: connection.sync_summary.busyDates ?? [],
          mailSignals: connection.sync_summary.mailSignals ?? [],
        };
      }
    }
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
        : await planScenicTripWithFallback(input, context);
    return NextResponse.json(plan, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return productApiError(error, "Trip planning request failed.");
  }
}
