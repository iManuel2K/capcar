import { afterEach, expect, it, vi } from "vitest";
import { requestRetail } from "./search-client";
import { RETAIL_STREAM_TYPE } from "./retail-contracts";
const input = {
  query: "E90",
  market: "DE",
  destination: "DE",
  condition: "all",
  sort: "bestMatch",
  page: 0,
} as const;
afterEach(() => vi.unstubAllGlobals());
it("handles HTML gateway errors without exposing response text", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response("<html>internal proxy</html>", { status: 504 }),
      ),
  );
  await expect(
    requestRetail(input, new AbortController().signal),
  ).rejects.toThrow("retailer took too long");
});
it("rejects unsafe result links even in a successful response", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        source: "ebay",
        checkedAt: "2026-09-10T12:00:00Z",
        hasMore: false,
        warning: "",
        items: [
          {
            id: "a",
            title: "Part",
            price: 20,
            currency: "EUR",
            shipping: null,
            country: null,
            condition: "Used",
            affiliate: false,
            url: "javascript:alert(1)",
          },
        ],
      }),
    ),
  );
  await expect(
    requestRetail(input, new AbortController().signal),
  ).rejects.toThrow("could not be read");
});
it("keeps operator credential diagnostics out of visitor-facing messages", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json(
        {
          code: "retailer_unavailable",
          error: "eBay rejected CapCar's production App ID or Cert ID.",
        },
        { status: 503 },
      ),
    ),
  );
  await expect(
    requestRetail(input, new AbortController().signal),
  ).rejects.toThrow("temporarily unavailable");
});
it("preserves a valid empty result", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        source: "ebay",
        checkedAt: "2026-09-10T12:00:00Z",
        hasMore: false,
        warning: "Check fitment",
        items: [],
      }),
    ),
  );
  expect(
    (await requestRetail(input, new AbortController().signal)).items,
  ).toEqual([]);
});

it("decodes partial results across chunk boundaries and returns the final response", async () => {
  const partial = {
    source: "partner",
    checkedAt: "2026-09-10T12:00:00Z",
    hasMore: false,
    warning: "Stück prüfen",
    items: [],
  };
  const complete = { ...partial, source: "multi" };
  const first = new TextEncoder().encode(
    JSON.stringify({ type: "partial", data: partial }) + "\n",
  );
  const response = new Response(
    new ReadableStream({
      start(controller) {
        const split = first.indexOf(0xc3) + 1;
        controller.enqueue(first.subarray(0, split));
        controller.enqueue(first.subarray(split));
        controller.enqueue(
          new TextEncoder().encode(
            JSON.stringify({ type: "complete", data: complete }) + "\n",
          ),
        );
        controller.close();
      },
    }),
    { headers: { "Content-Type": `${RETAIL_STREAM_TYPE}; charset=utf-8` } },
  );
  const fetch = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetch);
  const onPartial = vi.fn();

  await expect(
    requestRetail(input, new AbortController().signal, onPartial),
  ).resolves.toEqual(complete);
  expect(onPartial).toHaveBeenCalledExactlyOnceWith(partial);
  expect(fetch).toHaveBeenCalledWith(
    "/api/retail/search",
    expect.objectContaining({
      headers: expect.objectContaining({ Accept: RETAIL_STREAM_TYPE }),
    }),
  );
});
