import { NextResponse } from "next/server";

import { createOffersProvider } from "@/features/providers/offers-provider";
import { offerSearchRequestSchema } from "@/features/providers/provider-request-schema";

export async function POST(request: Request) {
  try {
    const input = offerSearchRequestSchema.parse(await request.json());
    const result = await createOffersProvider().search(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Offer search failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
