import { z } from "zod";
import {
  BUILD_STORAGE_KEY,
  readBuildState,
} from "@/features/builds/build-storage";
import { buildItemSchema } from "@/features/builds/build-schema";
import {
  safeEbayUrl,
  safeRetailUrl,
  type RetailItem,
} from "./retail-contracts";

const offerSchema = z
  .object({
    id: z.string().min(1).max(200),
    title: z.string().min(1).max(500),
    price: z.number().finite().nonnegative().max(1e6),
    shipping: z.number().finite().nonnegative().max(1e6).nullable(),
    currency: z.literal("EUR"),
    url: z.string(),
    provider: z.enum(["ebay", "partner"]).optional(),
  })
  .superRefine((offer, context) => {
    const valid =
      offer.provider === "partner"
        ? safeRetailUrl(offer.url)
        : safeEbayUrl(offer.url);
    if (!valid)
      context.addIssue({ code: "custom", message: "Invalid merchant link." });
  });

export function deliveredTotal(item: RetailItem): number | null {
  if (
    item.shipping === null ||
    !Number.isFinite(item.price) ||
    !Number.isFinite(item.shipping) ||
    item.price < 0 ||
    item.shipping < 0
  )
    return null;
  return Math.round((item.price + item.shipping) * 100) / 100;
}

export function selectBuildOffer(
  item: RetailItem,
  vehicleId: string,
  buildId: string,
  itemId: string,
  checkedAt: string,
  storage: Pick<Storage, "getItem" | "setItem">,
) {
  const offer = offerSchema.parse(item);
  z.iso.datetime().parse(checkedAt);
  const state = readBuildState(storage);
  if (
    !state.builds.some(
      (build) => build.id === buildId && build.vehicleId === vehicleId,
    )
  )
    throw new Error("Build not found.");
  const current = state.items.find(
    (entry) => entry.id === itemId && entry.buildId === buildId,
  );
  if (!current || current.status !== "planned")
    throw new Error(
      "Choose a planned modification. Ordered and installed records stay unchanged.",
    );
  const total = deliveredTotal(item);
  if (total === null)
    throw new Error(
      "Shipping is unknown. Confirm a delivered price before adding this offer to your budget.",
    );
  const selected = buildItemSchema.parse({
    ...current,
    workbench: current.workbench
      ? { ...current.workbench, selectedQuoteId: undefined }
      : undefined,
    selectedOfferId: offer.id,
    selectedOfferUrl: offer.url,
    merchantName: item.retailer ?? "Retailer",
    deliveredPrice: total,
    estimatedCost: Math.ceil(total),
    offerSelectedAt: checkedAt,
    updatedAt: new Date().toISOString(),
  });
  // Selecting again updates the same modification, never adds another expense.
  storage.setItem(
    BUILD_STORAGE_KEY,
    JSON.stringify({
      ...state,
      items: state.items.map((entry) =>
        entry.id === current.id ? selected : entry,
      ),
    }),
  );
  return selected;
}
