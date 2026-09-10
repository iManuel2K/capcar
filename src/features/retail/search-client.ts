import { z } from "zod";
import { safeEbayUrl, type RetailRequest } from "./retail-contracts";

const responseSchema = z.object({
  source: z.literal("ebay"),
  checkedAt: z.iso.datetime(),
  hasMore: z.boolean(),
  warning: z.string(),
  items: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        price: z.number().finite().nonnegative(),
        currency: z.string().regex(/^[A-Z]{3}$/),
        shipping: z.number().finite().nonnegative().nullable(),
        country: z.string().nullable(),
        condition: z.string(),
        affiliate: z.boolean(),
        url: z.string().refine(safeEbayUrl),
      }),
    )
    .max(200),
});
export class SearchFailure extends Error {
  constructor(
    message: string,
    public retryable = true,
  ) {
    super(message);
  }
}
export async function requestRetail(input: RetailRequest, signal: AbortSignal) {
  const response = await fetch("/api/retail/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
    cache: "no-store",
  });
  if (!response.ok) {
    const messages: Record<number, string> = {
      400: "Check your search phrase and delivery country.",
      401: "Public search is unavailable right now. Please try again later.",
      403: "Search could not be started. Reload this page and try again.",
      429: "Live search has reached its current allowance. Please try again later.",
      503: "Live listings are temporarily unavailable. Your search is still here.",
      504: "The retailer took too long to respond. Try again in a moment.",
    };
    throw new SearchFailure(
      messages[response.status] ?? "Search could not load. Please try again.",
      ![400, 401, 403, 429].includes(response.status),
    );
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new SearchFailure(
      "Search returned an unreadable response. Please try again.",
    );
  }
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success)
    throw new SearchFailure(
      "These listings could not be read. Please try again later.",
    );
  return parsed.data;
}
