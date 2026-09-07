import {
  type WishlistItem,
  type WishlistItemInput,
  type WishlistStatus,
  wishlistItemInputSchema,
  wishlistItemSchema,
} from "@/features/wishlist/wishlist-schema";

export const WISHLIST_STORAGE_KEY = "capcar.wishlist.v1";
export const WISHLIST_STORAGE_EVENT = "capcar:wishlist-changed";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readWishlist(storage: ReadableStorage): WishlistItem[] {
  const raw = storage.getItem(WISHLIST_STORAGE_KEY);
  if (!raw) return [];
  try {
    const result = wishlistItemSchema.array().safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function write(items: WishlistItem[], storage: WritableStorage) {
  storage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
}

export function saveWishlistItem(
  input: WishlistItemInput,
  storage: WritableStorage,
  options?: { id?: string; now?: string },
) {
  const normalized = wishlistItemInputSchema.parse(input);
  const now = options?.now ?? new Date().toISOString();
  const item = wishlistItemSchema.parse({
    ...normalized,
    id: options?.id ?? crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  });
  write([item, ...readWishlist(storage)], storage);
  return item;
}

export function updateWishlistStatus(
  id: string,
  status: WishlistStatus,
  storage: WritableStorage,
  now = new Date().toISOString(),
) {
  const items = readWishlist(storage).map((item) =>
    item.id === id
      ? wishlistItemSchema.parse({ ...item, status, updatedAt: now })
      : item,
  );
  write(items, storage);
}

export function removeWishlistItem(id: string, storage: WritableStorage) {
  write(
    readWishlist(storage).filter((item) => item.id !== id),
    storage,
  );
}

export function announceWishlistChange() {
  window.dispatchEvent(new Event(WISHLIST_STORAGE_EVENT));
}
