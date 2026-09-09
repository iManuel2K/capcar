import { describe, expect, it, vi } from "vitest";
import { searchEbay } from "./ebay-provider";
import { safeEbayUrl, retailRequestSchema } from "./retail-contracts";
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
  it("validates quantities and never admits credential-bearing URLs", () => {
    expect(safeEbayUrl("https://user:pass@www.ebay.de/itm/1")).toBe(false);
    expect(safeEbayUrl("https://www.ebay.de.evil.example/")).toBe(false);
    expect(retailRequestSchema.safeParse({ ...input, page: -1 }).success).toBe(
      false,
    );
  });
  it("surfaces upstream errors", async () => {
    await expect(
      searchEbay(
        input,
        { CAPCAR_EBAY_ACCESS_TOKEN: "test" },
        vi.fn().mockResolvedValue(new Response("", { status: 401 })),
      ),
    ).rejects.toThrow("retailer");
  });
});
