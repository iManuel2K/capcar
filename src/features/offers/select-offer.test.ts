import { describe, expect, it } from "vitest";

import { createBuild, readBuildState } from "@/features/builds/build-storage";
import { getOfferComparison } from "@/features/offers/offer-catalog";
import { selectOfferForBuild } from "@/features/offers/select-offer";
import { findCatalogPart } from "@/features/parts/part-catalog";

describe("offer selection", () => {
  it("creates one build item and updates it on reselection", () => {
    const storage = window.localStorage;
    storage.clear();
    const build = createBuild(
      {
        vehicleId: "vehicle-1",
        name: "OEM plus",
        goal: "OEM+ daily",
        description: "A careful and coherent demo build.",
        budget: 3000,
        status: "planning",
      },
      storage,
      { id: "build-1", createdAt: "2026-01-01T10:00:00.000Z" },
    );
    const part = findCatalogPart("demo-dark-rear-lamps-e90")!;
    const offers = getOfferComparison(part.id);

    selectOfferForBuild(part, offers[0], build.id, storage);
    selectOfferForBuild(part, offers[1], build.id, storage);

    const items = readBuildState(storage).items;
    expect(items).toHaveLength(1);
    expect(items[0].selectedOfferId).toBe(offers[1].id);
  });
});
