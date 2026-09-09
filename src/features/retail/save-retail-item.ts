import { safeEbayUrl, type RetailItem } from "./retail-contracts";
import {
  readWishlist,
  saveWishlistItem,
} from "@/features/wishlist/wishlist-storage";

export function saveRetailItem(
  item: RetailItem,
  vehicleId: string,
  checkedAt: string,
  storage: Pick<Storage, "getItem" | "setItem">,
) {
  if (!safeEbayUrl(item.url)) throw new Error("Invalid merchant link.");
  if (!vehicleId) throw new Error("Choose a vehicle first.");
  const existing = readWishlist(storage).find(
    (saved) => saved.vehicleId === vehicleId && saved.url === item.url,
  );
  if (existing) return existing;
  // Existing wishlist prices are EUR-only. Do not silently treat USD/GBP as EUR.
  return saveWishlistItem(
    {
      vehicleId,
      title: item.title.slice(0, 120),
      merchant: "eBay",
      url: item.url,
      status: "saved",
      currentPrice: item.currency === "EUR" ? item.price : undefined,
      note: `Observed ${item.price} ${item.currency}; shipping ${item.shipping === null ? "unknown" : item.shipping + " " + item.currency}. Checked ${checkedAt}. Fitment unverified; confirm total and returns at merchant.`.slice(
        0,
        300,
      ),
    },
    storage,
  );
}
