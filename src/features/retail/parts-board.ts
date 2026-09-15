import { z } from "zod";
import {
  safeEbayUrl,
  safeRetailUrl,
  retailRequestSchema,
  type RetailItem,
  type RetailRequest,
} from "./retail-contracts";
export const boardEntry = z
  .object({
    id: z.string().min(1).max(200),
    title: z.string().min(1).max(500),
    price: z.number().finite().nonnegative(),
    currency: z.enum(["EUR", "USD", "GBP"]),
    shipping: z.number().finite().nonnegative().nullable(),
    country: z.string().nullable(),
    condition: z.string(),
    url: z.string(),
    retailer: z.string().max(80).optional(),
    provider: z.enum(["ebay", "partner"]).optional(),
    providerItemId: z.string().max(220).optional(),
    affiliate: z.boolean(),
    input: retailRequestSchema,
    checkedAt: z.iso.datetime(),
    target: z.number().finite().positive().max(1e6).nullable(),
    history: z
      .array(
        z.object({
          price: z.number().finite().nonnegative(),
          at: z.iso.datetime(),
        }),
      )
      .max(30),
  })
  .superRefine((entry, context) => {
    const valid =
      entry.provider === "partner"
        ? safeRetailUrl(entry.url)
        : safeEbayUrl(entry.url);
    if (!valid)
      context.addIssue({ code: "custom", message: "Invalid merchant link." });
  });
export const boardSchema = z.array(boardEntry).max(12);
export type BoardEntry = z.infer<typeof boardEntry>;
export function boardKey(item: Pick<BoardEntry, "id" | "currency" | "input">) {
  return `${item.id}:${item.currency}:${item.input.market}:${item.input.destination}`;
}
export function observePrice(
  saved: BoardEntry,
  item: RetailItem,
  at: string,
): BoardEntry {
  if (
    saved.id !== item.id ||
    saved.currency !== item.currency ||
    at <= saved.checkedAt
  )
    return saved;
  const history = [...saved.history];
  if (history.at(-1)?.price !== item.price)
    history.push({ price: item.price, at });
  return boardEntry.parse({
    ...saved,
    ...item,
    checkedAt: at,
    history: history.slice(-30),
  });
}
export function addToBoard(
  entries: BoardEntry[],
  item: RetailItem,
  input: RetailRequest,
  at: string,
) {
  const entry = boardEntry.parse({
    ...item,
    input,
    checkedAt: at,
    target: null,
    history: [{ price: item.price, at }],
  });
  const existing = entries.findIndex(
    (value) => boardKey(value) === boardKey(entry),
  );
  if (existing >= 0)
    return entries.map((value, i) =>
      i === existing ? observePrice(value, item, at) : value,
    );
  if (entries.length >= 12) throw new Error("Board full");
  return [...entries, entry];
}
