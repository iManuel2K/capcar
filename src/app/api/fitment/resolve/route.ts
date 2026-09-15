import { NextResponse } from "next/server";

import {
  FitmentProviderUnavailable,
  fitmentResolutionRequestSchema,
  resolveConnectedFitment,
} from "@/features/fitment/fitment-provider";
import {
  guardProductApi,
  isSameOriginRequest,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Same-origin request required." },
      { status: 403, headers },
    );
  const guard = await guardProductApi("fitment-resolve", {
    limit: 20,
    windowSeconds: 60,
  });
  if (!guard.ok) return guard.response;
  try {
    const input = await readJsonRequest(
      request,
      fitmentResolutionRequestSchema,
    );
    return NextResponse.json(await resolveConnectedFitment(input), { headers });
  } catch (error) {
    if (error instanceof FitmentProviderUnavailable)
      return NextResponse.json(
        { error: error.message },
        { status: 503, headers },
      );
    return productApiError(error, "Fitment evidence could not be resolved.");
  }
}
