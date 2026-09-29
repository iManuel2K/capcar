import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ ebay: vi.fn(), partner: vi.fn() }));

vi.mock("@/features/retail/ebay-provider", async (original) => ({
  ...(await original<typeof import("@/features/retail/ebay-provider")>()),
  searchEbay: mocks.ebay,
}));
vi.mock("@/features/retail/partner-retail-provider", () => ({
  searchPartnerRetailer: mocks.partner,
}));

import { searchRetailers } from "./multi-retailer-provider";
import { retailRequestSchema } from "./retail-contracts";

describe("multi-retailer search", () => {
  const input = retailRequestSchema.parse({
    query: "BMW E90 rear light",
    market: "DE",
    destination: "DE",
  });

  beforeEach(() => {
    mocks.ebay.mockReset();
    mocks.partner.mockReset();
  });

  it("keeps a useful partial result when one provider is down", async () => {
    mocks.ebay.mockResolvedValue(result("ebay", "eBay", 240));
    mocks.partner.mockRejectedValue(new Error("Partner unavailable"));
    const response = await searchRetailers(input, {
      CAPCAR_RETAIL_PARTNER_NAME: "Partner",
    });
    expect(response.source).toBe("ebay");
    expect(response.items).toHaveLength(1);
    expect(response.providers).toContainEqual({
      id: "partner",
      label: "Partner",
      status: "unavailable",
      code: "unavailable",
      retryable: true,
    });
  });

  it("normalizes known totals across providers without currency conversion", async () => {
    mocks.ebay.mockResolvedValue(result("ebay", "eBay", 240));
    mocks.partner.mockResolvedValue(result("partner", "Partner", 210));
    const response = await searchRetailers(input, {
      CAPCAR_RETAIL_PARTNER_NAME: "Partner",
    });
    expect(response.source).toBe("multi");
    expect(response.items.map((item) => item.retailer)).toEqual([
      "Partner",
      "eBay",
    ]);
  });
});

function result(source: "ebay" | "partner", retailer: string, price: number) {
  return {
    source,
    checkedAt: "2026-09-15T12:00:00.000Z",
    hasMore: false,
    warning: "Confirm fitment",
    items: [
      {
        id: `${source}-1`,
        title: "Rear light",
        price,
        currency: "EUR",
        shipping: 0,
        country: "DE",
        condition: "New",
        url:
          source === "ebay"
            ? "https://www.ebay.de/itm/1"
            : "https://parts.example/1",
        affiliate: false,
        retailer,
        provider: source,
        providerItemId: `${source}-1`,
      },
    ],
  };
}
