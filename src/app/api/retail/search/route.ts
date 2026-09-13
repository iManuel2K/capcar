import { NextResponse } from "next/server";
import {
  isSameOriginRequest,
  readJsonRequest,
  productApiError,
} from "@/lib/api/guard";
import { guardPublicRetail } from "@/lib/api/public-retail-guard";
import { retailRequestSchema } from "@/features/retail/retail-contracts";
import { RetailUnavailable, searchEbay } from "@/features/retail/ebay-provider";
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Same-origin request required." },
      { status: 403, headers },
    );
  try {
    const input = await readJsonRequest(request, retailRequestSchema);
    const blocked = await guardPublicRetail();
    if (blocked) return blocked;
    return NextResponse.json(await searchEbay(input), { headers });
  } catch (error) {
    if (error instanceof RetailUnavailable) {
      console.warn("Retail provider failure", {
        reason: error.kind,
        message: error.message,
      });
      return NextResponse.json(
        {
          error: "Retailer search is temporarily unavailable.",
          code: "retailer_unavailable",
          reason: error.kind,
        },
        {
          status: error.kind === "rate_limit" ? 429 : 503,
          headers: {
            ...headers,
            ...(error.kind === "rate_limit" ? { "Retry-After": "60" } : {}),
          },
        },
      );
    }
    return productApiError(
      error,
      "Retail search failed. No demo prices were substituted.",
    );
  }
}
