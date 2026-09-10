import { NextResponse } from "next/server";
import { readJsonRequest, productApiError } from "@/lib/api/guard";
import { guardPublicRetail } from "@/lib/api/public-retail-guard";
import { retailRequestSchema } from "@/features/retail/retail-contracts";
import { RetailUnavailable, searchEbay } from "@/features/retail/ebay-provider";
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (request.headers.get("origin") !== new URL(request.url).origin)
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
