import { NextResponse } from "next/server";

import { createCatalogProvider } from "@/features/providers/catalog-provider";
import { partSearchRequestSchema } from "@/features/providers/provider-request-schema";
import {
  guardProductApi,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";

export async function POST(request: Request) {
  const guard = await guardProductApi("catalog-search");
  if (!guard.ok) return guard.response;
  try {
    const input = await readJsonRequest(request, partSearchRequestSchema);
    const result = await createCatalogProvider().search(input);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return productApiError(error, "Catalogue search failed.");
  }
}
