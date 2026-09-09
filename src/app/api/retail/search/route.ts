import { NextResponse } from "next/server";
import {
  guardProductApi,
  readJsonRequest,
  productApiError,
} from "@/lib/api/guard";
import { getAuthStatus } from "@/features/auth/auth-config";
import { retailRequestSchema } from "@/features/retail/retail-contracts";
import { RetailUnavailable, searchEbay } from "@/features/retail/ebay-provider";
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!getAuthStatus().configured)
    return NextResponse.json(
      { error: "Sign-in service is not configured." },
      { status: 503, headers },
    );
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Same-origin request required." },
      { status: 403, headers },
    );
  const guard = await guardProductApi("retail-search", { limit: 12 });
  if (!guard.ok) return guard.response;
  try {
    const input = await readJsonRequest(request, retailRequestSchema);
    return NextResponse.json(await searchEbay(input), { headers });
  } catch (error) {
    if (error instanceof RetailUnavailable)
      return NextResponse.json(
        { error: error.message },
        { status: 503, headers },
      );
    return productApiError(
      error,
      "Retail search failed. No demo prices were substituted.",
    );
  }
}
