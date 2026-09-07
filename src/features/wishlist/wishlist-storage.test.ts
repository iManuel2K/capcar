import { describe, expect, it } from "vitest";
import { readWishlist, saveWishlistItem, updateWishlistStatus } from "@/features/wishlist/wishlist-storage";

describe("wishlist storage", () => {
  it("saves secure links and advances purchase state", () => {
    localStorage.clear();
    const item = saveWishlistItem({ vehicleId: "vehicle-1", title: "Rear wing", url: "https://www.ebay.de/itm/123", merchant: "eBay", currentPrice: 249, targetPrice: 220, status: "saved" }, localStorage, { id: "wish-1", now: "2026-09-07T10:00:00.000Z" });
    updateWishlistStatus(item.id, "ordered", localStorage, "2026-09-07T11:00:00.000Z");
    expect(readWishlist(localStorage)[0]).toMatchObject({ id: "wish-1", status: "ordered", targetPrice: 220 });
  });
});
