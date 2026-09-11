import { NextResponse } from "next/server";
import { requestSchema } from "@/features/international/search";
import { searchInternational } from "@/features/international/ebay";
import {
  isSameOriginRequest,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";
import { guardPublicRetail } from "@/lib/api/public-retail-guard";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Same-origin request required." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  let input;
  try {
    input = await readJsonRequest(request, requestSchema, 2_048);
  } catch (error) {
    return productApiError(
      error,
      "Enter a search term, valid destination and postcode.",
    );
  }
  try {
    const blocked = await guardPublicRetail();
    if (blocked) return blocked;
    return NextResponse.json(await searchInternational(input), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Live search unavailable. Check server credentials, API access and quota. No demo results have been substituted.",
      },
      { status: 503 },
    );
  }
}
