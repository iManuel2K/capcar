import { describe, expect, it } from "vitest";

import {
  getOfferComparison,
  rankOffers,
} from "@/features/offers/offer-catalog";

describe("offer comparison", () => {
  it("calculates delivered totals and sorts cheapest first", () => {
    const offers = getOfferComparison("demo-dark-rear-lamps-e90");
    expect(offers).toHaveLength(3);
    expect(offers[0].isCheapest).toBe(true);
    expect(offers[0].deliveredTotal).toBeLessThanOrEqual(
      offers[1].deliveredTotal,
    );
  });

  it("chooses best value from trusted 30-day-return offers", () => {
    const ranked = rankOffers([
      {
        id: "cheap",
        partId: "part",
        merchantName: "Cheap",
        productPrice: 80,
        shippingPrice: 0,
        deliveryDays: 5,
        sellerRating: 4.1,
        condition: "New",
        warrantyMonths: 12,
        returnsDays: 14,
      },
      {
        id: "trusted",
        partId: "part",
        merchantName: "Trusted",
        productPrice: 90,
        shippingPrice: 0,
        deliveryDays: 2,
        sellerRating: 4.8,
        condition: "New",
        warrantyMonths: 24,
        returnsDays: 30,
      },
    ]);
    expect(ranked.find((offer) => offer.isBestValue)?.id).toBe("trusted");
  });

  it("includes quantity, shipping, required extras and fees in the real total", () => {
    const [ranked] = rankOffers(
      [
        {
          id: "complete-cost",
          partId: "part",
          merchantName: "Merchant",
          productPrice: 40,
          shippingPrice: 10,
          deliveryDays: 3,
          sellerRating: 4.8,
          condition: "New",
          warrantyMonths: 24,
          returnsDays: 30,
        },
      ],
      { quantity: 2, requiredExtrasPrice: 15, estimatedFees: 5 },
    );
    expect(ranked.subtotal).toBe(80);
    expect(ranked.deliveredTotal).toBe(110);
    expect(ranked.availability).toBe("unknown");
  });
});
