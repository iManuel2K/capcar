import { getEbayListingPhoto } from "@/features/retail/ebay-provider";
import { savedPhotoItemSchema } from "@/features/retail/retail-contracts";
import {
  isSameOriginRequest,
  productApiError,
  readJsonRequest,
} from "@/lib/api/guard";
import { guardPublicRetail } from "@/lib/api/public-retail-guard";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!isSameOriginRequest(request))
    return Response.json(
      { error: "Same-origin request required." },
      { status: 403, headers },
    );
  try {
    const entries = await readJsonRequest(
      request,
      savedPhotoItemSchema.array().min(1).max(12),
    );
    const unique = new Map(
      entries.map((entry) => [`${entry.market}:${entry.itemId}`, entry]),
    );
    const signal = AbortSignal.any([
      request.signal,
      AbortSignal.timeout(10_000),
    ]);
    const photos = [];
    for (const entry of unique.values()) {
      if (signal.aborted) break;
      const blocked = await guardPublicRetail();
      if (blocked) {
        if (!photos.length) return blocked;
        break;
      }
      const imageUrl = await getEbayListingPhoto(
        entry.itemId,
        entry.market,
        signal,
      ).catch(() => undefined);
      if (imageUrl) photos.push({ ...entry, imageUrl });
    }
    return Response.json(photos, { headers });
  } catch (error) {
    return productApiError(error, "Saved listing photos could not be loaded.");
  }
}
