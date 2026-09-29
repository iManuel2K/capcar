import { afterEach, describe, expect, it, vi } from "vitest";

import { searchPartnerRetailer } from "./partner-retail-provider";
import { retailRequestSchema } from "./retail-contracts";

afterEach(() => vi.unstubAllGlobals());

describe("partner retailer adapter", () => {
  const input = retailRequestSchema.parse({
    query: "BMW E90 rear light",
    market: "DE",
    destination: "DE",
    vehicle: {
      make: "BMW",
      model: "318i",
      productionYear: 2011,
      platform: "E90",
      bodyStyle: "Sedan",
      engineCode: "N43B20",
      transmission: "Manual",
    },
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
            fitment: {
              make: "BMW",
              platforms: ["E90"],
              engineCodes: ["N43B20"],
              yearFrom: 2009,
              yearTo: 2011,
              bodyStyles: ["Sedan"],
            },
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
      vehicleMatch: {
        status: "exact",
        matchedAxes: [
          "make",
          "platform",
          "engine",
          "production year",
          "body style",
        ],
        mismatchedAxes: [],
        source: "structured",
      },
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
