import { z } from "zod";

export const wishlistStatuses = ["saved", "ordered", "delivered"] as const;

export const wishlistItemInputSchema = z.object({
  vehicleId: z.string().min(1),
  title: z.string().trim().min(2).max(120),
  url: z.url().refine((value) => value.startsWith("https://"), {
    message: "Use a secure https:// link",
  }),
  merchant: z.string().trim().min(2).max(80),
  currentPrice: z.coerce.number().min(0).max(1_000_000).optional(),
  targetPrice: z.coerce.number().min(0).max(1_000_000).optional(),
  status: z.enum(wishlistStatuses).default("saved"),
  note: z.string().trim().max(300).optional(),
});

export const wishlistItemSchema = wishlistItemInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type WishlistItemInput = z.input<typeof wishlistItemInputSchema>;
export type WishlistItem = z.infer<typeof wishlistItemSchema>;
export type WishlistStatus = (typeof wishlistStatuses)[number];
