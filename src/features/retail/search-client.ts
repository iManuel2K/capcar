import { z } from "zod";
import {
  retailVehicleMatchSchema,
  safeRetailUrl,
  type RetailRequest,
} from "./retail-contracts";

const responseSchema = z.object({
  source: z.enum(["ebay", "partner", "multi"]),
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
        url: z.string().refine(safeRetailUrl),
        retailer: z.string().max(80).optional(),
        provider: z.enum(["ebay", "partner"]).optional(),
        providerItemId: z.string().max(220).optional(),
        vehicleMatch: retailVehicleMatchSchema.optional(),
      }),
    )
    .max(200),
  providers: z
    .array(
      z.object({
        id: z.enum(["ebay", "partner"]),
        label: z.string().max(80),
        status: z.enum(["available", "unavailable"]),
        code: z.enum(["access", "limit", "unavailable"]).optional(),
        retryable: z.boolean().optional(),
      }),
    )
    .optional(),
});
export class SearchFailure extends Error {
  constructor(
    message: string,
    public retryable = true,
    public code:
      | "invalid"
      | "access"
      | "limit"
      | "unavailable"
      | "timeout"
      | "unreadable" = "unavailable",
  ) {
    super(message);
  }
}
let retryAfter = 0;
export async function requestRetail(input: RetailRequest, signal: AbortSignal) {
  if (Date.now() < retryAfter)
    throw new SearchFailure(
      "Live search has reached its current allowance. Please try again later.",
      true,
      "limit",
    );
  const response = await fetch("/api/retail/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
    cache: "no-store",
  });
  if (!response.ok) {
    if (response.status === 429) {
      const seconds = Number(response.headers.get("Retry-After") ?? 60);
      retryAfter =
        Date.now() +
        Math.min(3600, Math.max(60, Number.isFinite(seconds) ? seconds : 60)) *
          1000;
    }
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
      ![400, 401, 403].includes(response.status),
      response.status === 400
        ? "invalid"
        : [401, 403].includes(response.status)
          ? "access"
          : response.status === 429
            ? "limit"
            : response.status === 504
              ? "timeout"
              : "unavailable",
    );
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new SearchFailure(
      "Search returned an unreadable response. Please try again.",
      true,
      "unreadable",
    );
  }
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success)
    throw new SearchFailure(
      "These listings could not be read. Please try again later.",
      true,
      "unreadable",
    );
  return parsed.data;
}
