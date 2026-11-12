import { z } from "zod";
import {
  RETAIL_STREAM_TYPE,
  retailVehicleMatchSchema,
  safeRetailUrl,
  type RetailRequest,
  type RetailResponse,
} from "./retail-contracts";

const responseSchema = z.object({
  source: z.enum(["ebay", "partner", "multi"]),
  checkedAt: z.iso.datetime(),
  hasMore: z.boolean(),
  warning: z.string(),
  freshness: z.enum(["live", "stale"]).optional(),
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
        code: z.enum(["access", "limit", "timeout", "unavailable"]).optional(),
        retryable: z.boolean().optional(),
      }),
    )
    .optional(),
});
const eventSchema = z.union([
  z.object({
    type: z.enum(["partial", "complete"]),
    data: responseSchema,
  }),
  z.object({
    type: z.literal("error"),
    status: z.union([z.literal(429), z.literal(503), z.literal(504)]),
    retryAfterSeconds: z.number().finite().nonnegative().optional(),
  }),
]);
const MAX_EVENT_LENGTH = 1_000_000;

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

function statusFailure(status: number, retryAfterSeconds = 60) {
  if (status === 429) {
    retryAfter =
      Date.now() +
      Math.min(
        3600,
        Math.max(
          60,
          Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : 60,
        ),
      ) *
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
  return new SearchFailure(
    messages[status] ?? "Search could not load. Please try again.",
    ![400, 401, 403].includes(status),
    status === 400
      ? "invalid"
      : [401, 403].includes(status)
        ? "access"
        : status === 429
          ? "limit"
          : status === 504
            ? "timeout"
            : "unavailable",
  );
}

function unreadableStream() {
  return new SearchFailure(
    "Search returned an unreadable response. Please try again.",
    true,
    "unreadable",
  );
}

async function readStream(
  body: ReadableStream<Uint8Array>,
  signal: AbortSignal,
  onPartial?: (result: RetailResponse) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const chunk = await reader.read();
      signal.throwIfAborted();
      if (chunk.done) throw unreadableStream();
      buffer += decoder.decode(chunk.value, { stream: true });
      for (
        let newline = buffer.indexOf("\n");
        newline >= 0;
        newline = buffer.indexOf("\n")
      ) {
        signal.throwIfAborted();
        if (newline > MAX_EVENT_LENGTH) throw unreadableStream();
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        let value: unknown;
        try {
          value = JSON.parse(line);
        } catch {
          throw unreadableStream();
        }
        const event = eventSchema.safeParse(value);
        if (!event.success) throw unreadableStream();
        if (event.data.type === "error")
          throw statusFailure(event.data.status, event.data.retryAfterSeconds);
        if (event.data.type === "complete") return event.data.data;
        onPartial?.(event.data.data);
      }
      if (buffer.length > MAX_EVENT_LENGTH) throw unreadableStream();
    }
  } finally {
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function requestRetail(
  input: RetailRequest,
  signal: AbortSignal,
  onPartial?: (result: RetailResponse) => void,
) {
  if (Date.now() < retryAfter)
    throw new SearchFailure(
      "Live search has reached its current allowance. Please try again later.",
      true,
      "limit",
    );
  const response = await fetch("/api/retail/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(onPartial ? { Accept: RETAIL_STREAM_TYPE } : {}),
    },
    body: JSON.stringify(input),
    signal,
    cache: "no-store",
  });
  if (!response.ok)
    throw statusFailure(
      response.status,
      Number(response.headers.get("Retry-After") ?? 60),
    );
  if (
    response.headers.get("Content-Type")?.split(";")[0] === RETAIL_STREAM_TYPE
  ) {
    if (!response.body) throw unreadableStream();
    return readStream(response.body, signal, onPartial);
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw unreadableStream();
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
