import { describe, expect, it } from "vitest";

import { createOffersProvider } from "@/features/providers/offers-provider";

describe("offers provider", () => {
  it("returns ranked delivered totals through the provider contract", async () => {
    const result = await createOffersProvider({}).search(
      "demo-dark-rear-lamps-e90",
    );
    expect(result.source).toBe("demo");
    expect(result.offers).toHaveLength(3);
    expect(result.offers[0].isCheapest).toBe(true);
    expect(result.destinationCountry).toBe("DE");
    expect(result.currency).toBe("EUR");
    expect(result.searchedAt).toMatch(/Z$/);
  });
});
