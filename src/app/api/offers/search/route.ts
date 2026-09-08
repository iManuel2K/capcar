import { NextResponse } from "next/server";

import { createOffersProvider } from "@/features/providers/offers-provider";
import { offerSearchRequestSchema } from "@/features/providers/provider-request-schema";
import {
  guardProductApi,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";

export async function POST(request: Request) {
  const guard = await guardProductApi("offers-search");
  if (!guard.ok) return guard.response;
  try {
    const input = await readJsonRequest(request, offerSearchRequestSchema);
    const result = await createOffersProvider().search(input);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return productApiError(error, "Offer search failed.");
  }
}
