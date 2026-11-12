import { NextResponse } from "next/server";
import {
  isSameOriginRequest,
  readJsonRequest,
  productApiError,
} from "@/lib/api/guard";
import { guardPublicRetail } from "@/lib/api/public-retail-guard";
import {
  RETAIL_STREAM_TYPE,
  retailRequestSchema,
  type RetailRequest,
  type RetailSearchEvent,
} from "@/features/retail/retail-contracts";
import { RetailUnavailable } from "@/features/retail/ebay-provider";
import { searchRetailers } from "@/features/retail/multi-retailer-provider";

function providerStatus(error: RetailUnavailable): 429 | 503 | 504 {
  return error.kind === "rate_limit"
    ? 429
    : error.kind === "timeout"
      ? 504
      : 503;
}

function logProviderFailure(error: RetailUnavailable) {
  console.warn("Retail provider failure", {
    reason: error.kind,
    message: error.message,
  });
}

function streamSearch(input: RetailRequest, headers: Record<string, string>) {
  const encoder = new TextEncoder();
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      function send(event: RetailSearchEvent) {
        if (!cancelled)
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      }
      void (async () => {
        try {
          const data = await searchRetailers(input, process.env, (partial) =>
            send({ type: "partial", data: partial }),
          );
          send({ type: "complete", data });
        } catch (error) {
          if (error instanceof RetailUnavailable) {
            logProviderFailure(error);
            send({
              type: "error",
              status: providerStatus(error),
              retryAfterSeconds: error.retryAfterSeconds,
            });
          } else {
            send({ type: "error", status: 503 });
          }
        } finally {
          if (!cancelled) controller.close();
        }
      })();
    },
    cancel() {
      cancelled = true;
    },
  });
  return new Response(stream, {
    headers: {
      ...headers,
      "Cache-Control": "no-store, no-transform",
      "Content-Type": `${RETAIL_STREAM_TYPE}; charset=utf-8`,
    },
  });
}

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store", Vary: "Accept" };
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Same-origin request required." },
      { status: 403, headers },
    );
  try {
    const input = await readJsonRequest(request, retailRequestSchema);
    const blocked = await guardPublicRetail();
    if (blocked) return blocked;
    if (request.headers.get("Accept") === RETAIL_STREAM_TYPE)
      return streamSearch(input, headers);
    return NextResponse.json(await searchRetailers(input), { headers });
  } catch (error) {
    if (error instanceof RetailUnavailable) {
      logProviderFailure(error);
      return NextResponse.json(
        {
          error: "Retailer search is temporarily unavailable.",
          code: "retailer_unavailable",
          reason: error.kind,
        },
        {
          status: providerStatus(error),
          headers: {
            ...headers,
            ...(error.kind === "rate_limit"
              ? {
                  "Retry-After": String(error.retryAfterSeconds ?? 60),
                }
              : {}),
          },
        },
      );
    }
    return productApiError(
      error,
      "Retail search failed. No demo prices were substituted.",
    );
  }
}
