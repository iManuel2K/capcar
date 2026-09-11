import { afterEach, expect, it, vi } from "vitest";
import { requestRetail } from "./search-client";
const input = {
  query: "E90",
  market: "DE",
  destination: "DE",
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
it("shows a safe provider diagnosis returned by the server", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json(
        {
          code: "retailer_unavailable",
          error: "eBay rejected Capcar's production App ID or Cert ID.",
        },
        { status: 503 },
      ),
    ),
  );
  await expect(
    requestRetail(input, new AbortController().signal),
  ).rejects.toThrow("production App ID or Cert ID");
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
