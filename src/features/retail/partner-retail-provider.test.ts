import { afterEach, describe, expect, it, vi } from "vitest";

import { searchPartnerRetailer } from "./partner-retail-provider";
import { retailRequestSchema } from "./retail-contracts";

afterEach(() => vi.unstubAllGlobals());

describe("partner retailer adapter", () => {
  const input = retailRequestSchema.parse({
    query: "BMW E90 rear light",
    market: "DE",
    destination: "DE",
  });

  it("normalizes an approved partner without exposing its API key", async () => {
    const request = vi.fn().mockResolvedValue(
      Response.json({
        items: [
          {
            id: "partner-1",
            title: "OEM rear light",
            price: 199,
            currency: "EUR",
            shipping: 9,
            country: "DE",
            condition: "New",
            url: "https://parts.example/item/1",
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", request);
    const result = await searchPartnerRetailer(input, {
      CAPCAR_RETAIL_PARTNER_NAME: "Parts Partner",
      CAPCAR_RETAIL_PARTNER_ENDPOINT: "https://api.parts.example/search",
      CAPCAR_RETAIL_PARTNER_API_KEY: "server-secret",
    });
    expect(result?.items[0]).toMatchObject({
      retailer: "Parts Partner",
      provider: "partner",
      providerItemId: "partner-1",
    });
    expect(request.mock.calls[0][1].headers.authorization).toBe(
      "Bearer server-secret",
    );
    expect(JSON.stringify(result)).not.toContain("server-secret");
  });

  it("rejects partial or insecure provider configuration", async () => {
    await expect(
      searchPartnerRetailer(input, {
        CAPCAR_RETAIL_PARTNER_NAME: "Partner",
        CAPCAR_RETAIL_PARTNER_ENDPOINT: "http://localhost/search",
        CAPCAR_RETAIL_PARTNER_API_KEY: "secret",
      }),
    ).rejects.toThrow("public HTTPS");
  });
});
