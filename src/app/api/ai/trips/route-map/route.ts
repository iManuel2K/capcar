import { NextResponse } from "next/server";

import {
  createTripRoute,
  tripRouteRequestSchema,
} from "@/features/trips/trip-route";
import {
  isSameOriginRequest,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  try {
    const input = await readJsonRequest(request, tripRouteRequestSchema);
    const route = await createTripRoute(input);
    return NextResponse.json(route, {
      headers: { "Cache-Control": "private, max-age=300" },
    });
  } catch (error) {
    console.error("Trip route calculation failed", error);
    return productApiError(error, "The calculated route is unavailable.");
  }
}
