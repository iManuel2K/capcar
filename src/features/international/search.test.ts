import { describe, it, expect, vi, afterEach } from "vitest";
import { demoSearch, ebayParams, inRegion, rank, requestSchema, subtotal } from "./search";
import { searchInternational } from "./ebay";
const input = requestSchema.parse({ query: "BMW lamps", postcode: "65428" });
afterEach(() => vi.unstubAllGlobals());
describe("international search", () => {
  it("separates Europe from EU", () => { expect(inRegion("GB", "EU")).toBe(false); expect(inRegion("GB", "EUROPE")).toBe(true); expect(inRegion(undefined, "DE")).toBe(false); });
  it("validates filter input", () => { expect(requestSchema.safeParse({ ...input, postcode: "DE,filter:bad" }).success).toBe(false); });
  it("passes shipping destination and location separately", () => { const p = ebayParams({ ...input, destination: "AT" }); expect(p.get("filter")).toContain("deliveryCountry:AT"); expect(p.get("filter")).toContain("itemLocationCountry:DE"); });
  it("keeps demos labelled and location filtered", () => { const result = demoSearch(input); expect(result.mode).toBe("demo"); expect(result.items.every(item => item.country === "DE")).toBe(true); });
  it("does not count missing shipping as zero", () => { const item = demoSearch(input).items[0]; expect(subtotal({ ...item, shipping: null })).toBeNull(); expect(rank([{ ...item, id: "unknown", price: 1, shipping: null }, item])[0].id).toBe(item.id); });
  it("does not call eBay until explicitly activated", async () => { const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher); expect((await searchInternational(input, {})).mode).toBe("demo"); expect(fetcher).not.toHaveBeenCalled(); });
  it("fails closed when live credentials are missing", async () => { await expect(searchInternational(input, { CAPCAR_EBAY_MODE: "live" })).rejects.toThrow("credentials"); });
  it("normalizes live response and sends server authentication", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "test-token", expires_in: 3600 }))).mockResolvedValueOnce(new Response(JSON.stringify({ itemSummaries: [{ itemId: "1", title: "Lamp", price: { value: "20", currency: "EUR" }, itemLocation: { country: "DE" }, itemWebUrl: "javascript:alert(1)" }] })));
    vi.stubGlobal("fetch", fetcher);
    const result = await searchInternational(input, { CAPCAR_EBAY_MODE: "live", EBAY_CLIENT_ID: "test-id", EBAY_CLIENT_SECRET: "test-secret" });
    expect(result.mode).toBe("live"); expect(result.items[0].shipping).toBeNull(); expect(result.items[0].url).toBeUndefined(); expect(JSON.stringify(result)).not.toContain("test-secret"); expect(fetcher.mock.calls[1][1].headers["X-EBAY-C-MARKETPLACE-ID"]).toBe("EBAY_DE");
  });
});
