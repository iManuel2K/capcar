import { NextResponse } from "next/server";
import { requestSchema } from "@/features/international/search";
import { searchInternational } from "@/features/international/ebay";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let raw: string;
  try { raw = await request.text(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  if (raw.length > 2048) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  let input;
  try { input = requestSchema.parse(JSON.parse(raw)); } catch { return NextResponse.json({ error: "Enter a search term, valid destination and postcode." }, { status: 400 }); }
  try { return NextResponse.json(await searchInternational(input), { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Live search unavailable. Check server credentials, API access and quota. No demo results have been substituted." }, { status: 503 }); }
}
