import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveConnectedFitment } from "./fitment-provider";

afterEach(() => vi.unstubAllGlobals());

describe("connected fitment provider", () => {
  const input = {
    vehicle: {
      make: "BMW",
      model: "318i",
      productionYear: 2011,
      platform: "E90",
      bodyStyle: "Sedan" as const,
      engineCode: "N43B20",
      transmission: "Manual" as const,
    },
    partNumber: "63217252093",
  };

  it("imports only validated provider evidence", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          records: [
            {
              kind: "seller",
              source: "BMW ETK",
              url: "https://parts.bmw.example/e90/63217252093",
              partNumber: input.partNumber,
              make: "BMW",
              platform: "E90",
              engineCode: "N43B20",
              bodyStyle: "Sedan",
              transmission: "Manual",
              yearFrom: 2009,
              yearTo: 2011,
              verdict: "exact",
              oeCrossReferences: [],
              supportingModifications: [],
              note: "Vehicle-specific manufacturer catalogue record.",
            },
          ],
        }),
      ),
    );
    const result = await resolveConnectedFitment(input, {
      CAPCAR_FITMENT_PROVIDER_NAME: "BMW catalogue partner",
      CAPCAR_FITMENT_PROVIDER_ENDPOINT: "https://fitment.example/resolve",
      CAPCAR_FITMENT_PROVIDER_API_KEY: "secret",
    });
    expect(result.records[0]).toMatchObject({
      kind: "manufacturer",
      capturedBy: "provider",
      verdict: "exact",
    });
  });

  it("does not claim connected evidence without configuration", async () => {
    await expect(resolveConnectedFitment(input, {})).rejects.toThrow(
      "not configured",
    );
  });
});
