import { describe, expect, it } from "vitest";
import {
  readWishlist,
  saveWishlistItem,
  updateWishlistStatus,
  updateWishlistItem,
} from "@/features/wishlist/wishlist-storage";

describe("wishlist storage", () => {
  it("edits details without resetting a newer delivery state or moving between vehicles", () => {
    localStorage.clear();
    const input = {
      vehicleId: "a",
      title: "Rear lights",
      merchant: "Retailer",
      url: "https://www.ebay.de/itm/123",
      currentPrice: 100,
    };
    const item = saveWishlistItem(input, localStorage);
    updateWishlistStatus(item.id, "delivered", localStorage);
    updateWishlistItem(
      item.id,
      { ...input, currentPrice: 90, status: "saved" },
      localStorage,
    );
    expect(readWishlist(localStorage)).toHaveLength(1);
    expect(readWishlist(localStorage)[0]).toMatchObject({
      currentPrice: 90,
      status: "delivered",
      createdAt: item.createdAt,
    });
    expect(() =>
      updateWishlistItem(item.id, { ...input, vehicleId: "b" }, localStorage),
    ).toThrow();
  });
  it("saves secure links and advances purchase state", () => {
    localStorage.clear();
    const item = saveWishlistItem(
      {
        vehicleId: "vehicle-1",
        title: "Rear wing",
        url: "https://www.ebay.de/itm/123",
        merchant: "eBay",
        currentPrice: 249,
        targetPrice: 220,
        status: "saved",
      },
      localStorage,
      { id: "wish-1", now: "2026-09-07T10:00:00.000Z" },
    );
    updateWishlistStatus(
      item.id,
      "ordered",
      localStorage,
      "2026-09-07T11:00:00.000Z",
    );
    expect(readWishlist(localStorage)[0]).toMatchObject({
      id: "wish-1",
      status: "ordered",
      targetPrice: 220,
    });
  });
});
