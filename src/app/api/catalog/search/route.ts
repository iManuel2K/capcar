import { NextResponse } from "next/server";

import { createCatalogProvider } from "@/features/providers/catalog-provider";
import { partSearchRequestSchema } from "@/features/providers/provider-request-schema";

export async function POST(request: Request) {
  try {
    const input = partSearchRequestSchema.parse(await request.json());
    const result = await createCatalogProvider().search(input);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Catalogue search failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
