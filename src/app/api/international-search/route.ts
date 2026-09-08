import { NextResponse } from "next/server";
import { requestSchema } from "@/features/international/search";
import { searchInternational } from "@/features/international/ebay";
import {
  guardProductApi,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const guard = await guardProductApi("international-search", { limit: 20 });
  if (!guard.ok) return guard.response;
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
