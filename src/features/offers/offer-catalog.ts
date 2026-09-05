import { findCatalogPart } from "@/features/parts/part-catalog";

export type DemoOffer = {
  id: string;
  partId: string;
  merchantName: string;
  productPrice: number;
  shippingPrice: number;
  deliveryDays: number;
  sellerRating: number;
  condition: "New" | "Remanufactured";
  warrantyMonths: number;
  returnsDays: number;
  availability?: "in-stock" | "limited" | "backorder" | "unknown";
  taxIncluded?: boolean;
  priceCheckedAt?: string;
  purchaseUrl?: string;
};

export type RankedOffer = DemoOffer & {
  quantity: number;
  subtotal: number;
  requiredExtrasPrice: number;
  estimatedFees: number;
  availability: "in-stock" | "limited" | "backorder" | "unknown";
  taxIncluded: boolean;
  priceCheckedAt: string;
  deliveredTotal: number;
  isCheapest: boolean;
  isBestValue: boolean;
};

const merchantProfiles = [
  {
    key: "nordwerk",
    name: "NordWerk Demo",
    priceFactor: 0.96,
    shipping: 14.9,
    deliveryDays: 4,
    rating: 4.4,
    warrantyMonths: 12,
    returnsDays: 14,
    availability: "limited",
  },
  {
    key: "autobahn",
    name: "Autobahn Parts Lab",
    priceFactor: 1,
    shipping: 0,
    deliveryDays: 2,
    rating: 4.8,
    warrantyMonths: 24,
    returnsDays: 30,
    availability: "in-stock",
  },
  {
    key: "garage-markt",
    name: "Garage Markt Demo",
    priceFactor: 0.91,
    shipping: 29.9,
    deliveryDays: 6,
    rating: 4.6,
    warrantyMonths: 12,
    returnsDays: 30,
    availability: "backorder",
  },
] as const;

function money(value: number) {
  return Math.round(value * 100) / 100;
}

export function getDemoOffers(partId: string): DemoOffer[] {
  const part = findCatalogPart(partId);
  if (!part) return [];

  return merchantProfiles.map((merchant) => ({
    id: `demo-offer-${merchant.key}-${partId}`,
    partId,
    merchantName: merchant.name,
    productPrice: money(part.estimatedPrice * merchant.priceFactor),
    shippingPrice: merchant.shipping,
    deliveryDays: merchant.deliveryDays,
    sellerRating: merchant.rating,
    condition: "New",
    warrantyMonths: merchant.warrantyMonths,
    returnsDays: merchant.returnsDays,
    availability: merchant.availability,
    taxIncluded: true,
  }));
}

export function rankOffers(
  offers: DemoOffer[],
  options: {
    quantity?: number;
    requiredExtrasPrice?: number;
    estimatedFees?: number;
    searchedAt?: string;
  } = {},
): RankedOffer[] {
  if (offers.length === 0) return [];
  const quantity = Math.max(1, Math.trunc(options.quantity ?? 1));
  const requiredExtrasPrice = money(options.requiredExtrasPrice ?? 0);
  const estimatedFees = money(options.estimatedFees ?? 0);
  const searchedAt = options.searchedAt ?? new Date().toISOString();
  const totals = offers.map((offer) =>
    money(
      offer.productPrice * quantity +
        offer.shippingPrice +
        requiredExtrasPrice +
        estimatedFees,
    ),
  );
  const cheapestTotal = Math.min(...totals);
  const trustedCandidates = offers
    .map((offer, index) => ({ offer, total: totals[index] }))
    .filter(({ offer }) => offer.sellerRating >= 4.5 && offer.returnsDays >= 30)
    .sort(
      (a, b) =>
        a.total - b.total || b.offer.sellerRating - a.offer.sellerRating,
    );
  const bestValueId =
    trustedCandidates[0]?.offer.id ?? offers[totals.indexOf(cheapestTotal)].id;

  return offers
    .map((offer, index) => ({
      ...offer,
      quantity,
      subtotal: money(offer.productPrice * quantity),
      requiredExtrasPrice,
      estimatedFees,
      availability: offer.availability ?? "unknown",
      taxIncluded: offer.taxIncluded ?? false,
      priceCheckedAt: offer.priceCheckedAt ?? searchedAt,
      deliveredTotal: totals[index],
      isCheapest: totals[index] === cheapestTotal,
      isBestValue: offer.id === bestValueId,
    }))
    .sort(
      (a, b) =>
        a.deliveredTotal - b.deliveredTotal || b.sellerRating - a.sellerRating,
    );
}

export function getOfferComparison(
  partId: string,
  options: Parameters<typeof rankOffers>[1] = {},
) {
  return rankOffers(getDemoOffers(partId), options);
}

export function findDemoOffer(offerId: string) {
  return rankOffers(
    merchantProfiles.flatMap((merchant) => {
      const marker = `demo-offer-${merchant.key}-`;
      if (!offerId.startsWith(marker)) return [];
      return getDemoOffers(offerId.slice(marker.length));
    }),
  ).find((offer) => offer.id === offerId);
}
