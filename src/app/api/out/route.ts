import { NextRequest, NextResponse } from "next/server";

import { isTrackedMerchantUrl } from "@/features/affiliate/affiliate-link";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const destination = request.nextUrl.searchParams.get("url") ?? "";
  if (!isTrackedMerchantUrl(destination)) {
    return NextResponse.json({ error: "Unsupported merchant URL" }, { status: 400 });
  }

  const url = new URL(destination);
  url.searchParams.set("utm_source", "capcar");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "beta_wishlist");

  try {
    const client = await createClient();
    await client.from("affiliate_clicks").insert({
      merchant: url.hostname,
      item_id: request.nextUrl.searchParams.get("item")?.slice(0, 120) ?? null,
    });
  } catch {
    // Tracking must never block the user's route to the merchant.
  }

  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
