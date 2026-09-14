import { describe, expect, it } from "vitest";
import { deliveredTotal, selectBuildOffer } from "./build-offer";
import {
  createStarterBuild,
  readBuildState,
  updateBuildItemStatus,
} from "@/features/builds/build-storage";
import type { RetailItem } from "./retail-contracts";
const at = "2026-09-13T10:00:00.000Z";
const offer: RetailItem = {
  id: "offer",
  title: "Rear light set",
  price: 220.25,
  currency: "EUR",
  shipping: 9.5,
  country: "DE",
  condition: "Used",
  url: "https://www.ebay.de/itm/12345",
  affiliate: false,
};
function setup() {
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
  const build = createStarterBuild(
    {
      vehicleId: "car",
      name: "Street OEM",
      goal: "Appearance",
      description: "A clean OEM street build.",
      budget: 1000,
    },
    {
      title: "Rear lights",
      stage: "appearance",
      priority: "now",
      estimatedCost: 300,
      note: "Keep this original note.",
    },
    storage,
  );
  return { storage, build, item: readBuildState(storage).items[0] };
}
describe("select a live offer for a planned modification", () => {
  it("preserves notes, stores evidence and updates the existing item idempotently", () => {
    const { storage, build, item } = setup();
    for (let count = 0; count < 2; count++)
      selectBuildOffer(offer, "car", build.id, item.id, at, storage);
    const state = readBuildState(storage);
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({
      id: item.id,
      selectedOfferUrl: offer.url,
      deliveredPrice: 229.75,
      estimatedCost: 230,
      note: item.note,
      status: "planned",
    });
  });
  it.each([
    { ...offer, shipping: null },
    { ...offer, currency: "USD" },
    { ...offer, price: -1 },
    { ...offer, url: "javascript:alert(1)" },
  ])("rejects unsafe or incomplete budgets", (candidate) => {
    const { storage, build, item } = setup();
    const before = JSON.stringify(readBuildState(storage));
    expect(() =>
      selectBuildOffer(candidate, "car", build.id, item.id, at, storage),
    ).toThrow();
    expect(JSON.stringify(readBuildState(storage))).toBe(before);
  });
  it("rejects cross-vehicle writes", () => {
    const { storage, build, item } = setup();
    expect(() =>
      selectBuildOffer(offer, "other", build.id, item.id, at, storage),
    ).toThrow("Build not found");
  });
  it("preserves purchased and installed records", () => {
    const { storage, build, item } = setup();
    updateBuildItemStatus(item.id, "installed", storage);
    expect(() =>
      selectBuildOffer(offer, "car", build.id, item.id, at, storage),
    ).toThrow("planned modification");
  });
  it("does not equate unknown shipping with zero", () => {
    expect(deliveredTotal({ ...offer, shipping: null })).toBeNull();
    expect(deliveredTotal({ ...offer, shipping: 0 })).toBe(220.25);
  });
});
