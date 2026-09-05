import { buildItemSchema } from "@/features/builds/build-schema";
import {
  BUILD_STORAGE_KEY,
  createBuildItem,
  readBuildState,
} from "@/features/builds/build-storage";
import type { RankedOffer } from "@/features/offers/offer-catalog";
import type { CatalogPart } from "@/features/parts/part-catalog";

type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function selectOfferForBuild(
  part: CatalogPart,
  offer: RankedOffer,
  buildId: string,
  storage: WritableStorage,
  now = new Date().toISOString(),
) {
  let state = readBuildState(storage);
  let item = state.items.find(
    (candidate) =>
      candidate.buildId === buildId && candidate.catalogPartId === part.id,
  );

  if (!item) {
    item = createBuildItem(
      {
        buildId,
        title: part.name,
        note: "Selected from fictional Capcar offers. Verify fitment and terms.",
        catalogPartId: part.id,
        stage: part.buildStage,
        priority: "next",
        estimatedCost: Math.round(offer.deliveredTotal),
        status: "planned",
      },
      storage,
      { createdAt: now },
    );
    state = readBuildState(storage);
  }

  const updated = buildItemSchema.parse({
    ...item,
    selectedOfferId: offer.id,
    merchantName: offer.merchantName,
    deliveredPrice: offer.deliveredTotal,
    estimatedCost: Math.round(offer.deliveredTotal),
    offerSelectedAt: now,
    updatedAt: now,
  });
  const items = state.items.map((candidate) =>
    candidate.id === updated.id ? updated : candidate,
  );
  storage.setItem(
    BUILD_STORAGE_KEY,
    JSON.stringify({ builds: state.builds, items }),
  );
  return updated;
}
