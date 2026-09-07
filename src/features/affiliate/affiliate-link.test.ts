import { describe, expect, it } from "vitest";
import { buildOutboundUrl, isTrackedMerchantUrl } from "@/features/affiliate/affiliate-link";

describe("affiliate link routing", () => {
  it("routes supported merchants without accepting arbitrary redirects", () => {
    expect(isTrackedMerchantUrl("https://www.ebay.de/itm/123")).toBe(true);
    expect(buildOutboundUrl("https://www.ebay.de/itm/123", "wish-1")).toContain("/api/out?");
    expect(isTrackedMerchantUrl("https://example.com/item")).toBe(false);
    expect(buildOutboundUrl("https://example.com/item", "wish-1")).toBe("https://example.com/item");
  });
});
