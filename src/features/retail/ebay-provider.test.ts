import { describe, expect, it, vi } from "vitest";
import { searchEbay } from "./ebay-provider";
import {
  ebaySearchUrl,
  safeEbayUrl,
  retailRequestSchema,
} from "./retail-contracts";
describe("live retailer adapter", () => {
  const input = retailRequestSchema.parse({
    query: "BMW 318i bumper",
    market: "DE",
    destination: "FR",
  });
  it("does not substitute fictional results when credentials are missing", async () => {
    const fetcher = vi.fn();
    await expect(searchEbay(input, {}, fetcher)).rejects.toThrow(
      "not connected",
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("keeps missing delivery costs unknown and rejects external purchase hosts", async () => {
    const item = {
      itemId: "real-id",
      title: "Bumper",
      price: { value: "120.50", currency: "EUR" },
      itemWebUrl: "https://www.ebay.de/itm/123",
    };
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          itemSummaries: [
            item,
            { ...item, itemWebUrl: "https://evil.example/" },
          ],
        }),
      ),
    );
    const result = await searchEbay(
      input,
      { CAPCAR_EBAY_ACCESS_TOKEN: "test-only" },
      fetcher,
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].shipping).toBeNull();
    expect(result.items[0].affiliate).toBe(false);
    const [url, options] = fetcher.mock.calls[0];
    expect(String(url)).toContain("deliveryCountry%3AFR");
    expect(options.headers["X-EBAY-C-MARKETPLACE-ID"]).toBe("EBAY_DE");
    expect(options.redirect).toBe("error");
  });
  it("prefers renewable application credentials over a stale static token", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ access_token: "fresh-token", expires_in: 7200 }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ itemSummaries: [] })),
      );
    await searchEbay(
      input,
      {
        CAPCAR_EBAY_CLIENT_ID: "renewable-test-id",
        CAPCAR_EBAY_CLIENT_SECRET: "renewable-test-secret",
        CAPCAR_EBAY_ACCESS_TOKEN: "expired-static-token",
      },
      fetcher,
    );
    expect(String(fetcher.mock.calls[0][0])).toContain("oauth2/token");
    expect(fetcher.mock.calls[1][1].headers.Authorization).toBe(
      "Bearer fresh-token",
    );
  });
  it("validates quantities and never admits credential-bearing URLs", () => {
    expect(safeEbayUrl("https://user:pass@www.ebay.de/itm/1")).toBe(false);
    expect(safeEbayUrl("https://www.ebay.de.evil.example/")).toBe(false);
    expect(retailRequestSchema.safeParse({ ...input, page: -1 }).success).toBe(
      false,
    );
    expect(ebaySearchUrl(input)).toBe(
      "https://www.ebay.de/sch/i.html?_nkw=BMW+318i+bumper",
    );
  });
  it("passes condition, price and sort refinements to eBay", async () => {
    const filtered = retailRequestSchema.parse({
      ...input,
      condition: "used",
      sort: "priceAsc",
      minPrice: 50,
      maxPrice: 250,
    });
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ itemSummaries: [] })));
    await searchEbay(
      filtered,
      { CAPCAR_EBAY_ACCESS_TOKEN: "test-only" },
      fetcher,
    );
    const url = new URL(String(fetcher.mock.calls[0][0]));
    expect(url.searchParams.get("filter")).toBe(
      "deliveryCountry:FR,buyingOptions:{FIXED_PRICE},conditionIds:{3000},price:[50..250],priceCurrency:EUR",
    );
    expect(url.searchParams.get("sort")).toBe("price");
    expect(ebaySearchUrl(filtered)).toBe(
      "https://www.ebay.de/sch/i.html?_nkw=BMW+318i+bumper&LH_ItemCondition=3000&_udlo=50&_udhi=250&_sop=15",
    );
  });
  it("rejects an inverted price range before provider access", () => {
    expect(
      retailRequestSchema.safeParse({
        ...input,
        minPrice: 500,
        maxPrice: 100,
      }).success,
    ).toBe(false);
  });
  it("surfaces upstream errors", async () => {
    await expect(
      searchEbay(
        input,
        { CAPCAR_EBAY_ACCESS_TOKEN: "test" },
        vi.fn().mockResolvedValue(new Response("", { status: 401 })),
      ),
    ).rejects.toThrow("Browse API access");
  });
  it("refreshes a rejected token once and retries the same search", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ access_token: "old", expires_in: 7200 }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        Response.json({ access_token: "replacement", expires_in: 7200 }),
      )
      .mockResolvedValueOnce(Response.json({ itemSummaries: [] }));
    const result = await searchEbay(
      input,
      {
        CAPCAR_EBAY_CLIENT_ID: "refresh-once",
        CAPCAR_EBAY_CLIENT_SECRET: "test",
      },
      request,
    );
    expect(result.items).toEqual([]);
    expect(request).toHaveBeenCalledTimes(4);
    expect(request.mock.calls[3][1].headers.Authorization).toBe(
      "Bearer replacement",
    );
  });
  it("does not retry an authorization denial indefinitely", async () => {
    const request = vi
      .fn()
      .mockImplementation((url) =>
        String(url).includes("oauth2")
          ? Promise.resolve(
              Response.json({ access_token: "denied", expires_in: 7200 }),
            )
          : Promise.resolve(new Response(null, { status: 401 })),
      );
    await expect(
      searchEbay(
        input,
        {
          CAPCAR_EBAY_CLIENT_ID: "deny-once",
          CAPCAR_EBAY_CLIENT_SECRET: "test",
        },
        request,
      ),
    ).rejects.toMatchObject({ kind: "authorization" });
    expect(request).toHaveBeenCalledTimes(4);
  });
  it("does not diagnose token service outages as bad credentials", async () => {
    await expect(
      searchEbay(
        input,
        { CAPCAR_EBAY_CLIENT_ID: "outage", CAPCAR_EBAY_CLIENT_SECRET: "test" },
        vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
      ),
    ).rejects.toMatchObject({ kind: "unavailable" });
  });
  it("refreshes credentials after rotation and shares simultaneous token requests", async () => {
    const request = vi
      .fn()
      .mockImplementation((url) =>
        Promise.resolve(
          String(url).includes("oauth2")
            ? Response.json({ access_token: "fresh", expires_in: 7200 })
            : Response.json({ itemSummaries: [] }),
        ),
      );
    const env = {
      CAPCAR_EBAY_CLIENT_ID: "shared-rotation",
      CAPCAR_EBAY_CLIENT_SECRET: "first",
    };
    await Promise.all([
      searchEbay(input, env, request),
      searchEbay(input, env, request),
    ]);
    expect(
      request.mock.calls.filter(([url]) => String(url).includes("oauth2")),
    ).toHaveLength(1);
    await searchEbay(
      input,
      { ...env, CAPCAR_EBAY_CLIENT_SECRET: "second" },
      request,
    );
    expect(
      request.mock.calls.filter(([url]) => String(url).includes("oauth2")),
    ).toHaveLength(2);
  });
});
