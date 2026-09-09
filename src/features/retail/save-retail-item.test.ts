import { beforeEach, describe, expect, it } from "vitest";
import { saveRetailItem } from "./save-retail-item";
import { readWishlist } from "@/features/wishlist/wishlist-storage";
import type { RetailItem } from "./retail-contracts";
const item: RetailItem = {
  id: "one",
  title: "Example part",
  price: 50,
  currency: "USD",
  shipping: null,
  country: "US",
  condition: "used",
  url: "https://www.ebay.com/itm/123",
  affiliate: false,
};
describe("save retailer listing", () => {
  beforeEach(() => localStorage.clear());
  it("does not mislabel foreign prices as euros", () => {
    const saved = saveRetailItem(item, "vehicle", "2026-09-09", localStorage);
    expect(saved.currentPrice).toBeUndefined();
    expect(saved.note).toContain("50 USD");
  });
  it("keeps repeat saves idempotent", () => {
    saveRetailItem(item, "vehicle", "2026-09-09", localStorage);
    saveRetailItem(item, "vehicle", "2026-09-09", localStorage);
    expect(readWishlist(localStorage)).toHaveLength(1);
  });
  it("rejects untrusted merchant links", () => {
    expect(() =>
      saveRetailItem(
        { ...item, url: "https://evil.example" },
        "vehicle",
        "",
        localStorage,
      ),
    ).toThrow();
    expect(readWishlist(localStorage)).toHaveLength(0);
  });
});
