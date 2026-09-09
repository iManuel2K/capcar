import { z } from "zod";
import {
  safeEbayUrl,
  type RetailRequest,
  type RetailResponse,
} from "./retail-contracts";

const money = z.object({
  value: z.string().regex(/^\d+(\.\d{1,4})?$/),
  currency: z.string().regex(/^[A-Z]{3}$/),
});
const responseSchema = z.object({
  total: z.number().optional(),
  next: z.string().optional(),
  itemSummaries: z
    .array(
      z.object({
        itemId: z.string(),
        title: z.string(),
        price: money,
        itemWebUrl: z.string(),
        itemAffiliateWebUrl: z.string().optional(),
        condition: z.string().optional(),
        itemLocation: z.object({ country: z.string().optional() }).optional(),
        shippingOptions: z
          .array(z.object({ shippingCost: money.optional() }))
          .optional(),
      }),
    )
    .max(200)
    .default([]),
});
export class RetailUnavailable extends Error {}
export async function searchEbay(
  input: RetailRequest,
  env: Record<string, string | undefined> = process.env,
  request: typeof fetch = fetch,
): Promise<RetailResponse> {
  let token = env.CAPCAR_EBAY_ACCESS_TOKEN;
  if (!token && !(env.CAPCAR_EBAY_CLIENT_ID && env.CAPCAR_EBAY_CLIENT_SECRET))
    throw new RetailUnavailable("Live retailer search is not connected yet.");
  if (!token) {
    const auth = await request(
      "https://api.ebay.com/identity/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${env.CAPCAR_EBAY_CLIENT_ID}:${env.CAPCAR_EBAY_CLIENT_SECRET}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
        redirect: "error",
      },
    );
    if (!auth.ok)
      throw new RetailUnavailable(
        "Retailer authorization failed. The operator must check the eBay integration.",
      );
    token = z
      .object({ access_token: z.string().min(1) })
      .parse(await auth.json()).access_token;
  }
  const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  url.searchParams.set("q", input.query);
  url.searchParams.set("limit", "20");
  url.searchParams.set("offset", String(input.page * 20));
  url.searchParams.set(
    "filter",
    `deliveryCountry:${input.destination},buyingOptions:{FIXED_PRICE}`,
  );
  const campaign = env.CAPCAR_EBAY_CAMPAIGN_ID?.trim();
  if (campaign && !/^\d{1,30}$/.test(campaign))
    throw new RetailUnavailable("Affiliate configuration is invalid.");
  const response = await request(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": `EBAY_${input.market}`,
      ...(campaign
        ? { "X-EBAY-C-ENDUSERCTX": `affiliateCampaignId=${campaign}` }
        : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
    redirect: "error",
  });
  if (!response.ok)
    throw new RetailUnavailable(
      "The retailer is unavailable or has rejected the request. Try again later.",
    );
  const payload = responseSchema.parse(await response.json());
  return {
    source: "ebay",
    checkedAt: new Date().toISOString(),
    hasMore: Boolean(payload.next) && input.page < 9,
    warning:
      "Retailer results are not fitment verification. Shipping may change with your address; taxes and import charges may be additional. Confirm availability and the final total at the retailer. No currency conversion is applied.",
    items: payload.itemSummaries.flatMap((item) => {
      const affiliate = Boolean(
        campaign &&
        item.itemAffiliateWebUrl &&
        safeEbayUrl(item.itemAffiliateWebUrl),
      );
      const target = affiliate ? item.itemAffiliateWebUrl! : item.itemWebUrl;
      if (!safeEbayUrl(target)) return [];
      const shipping = item.shippingOptions?.[0]?.shippingCost;
      return [
        {
          id: item.itemId,
          title: item.title,
          price: Number(item.price.value),
          currency: item.price.currency,
          shipping:
            shipping?.currency === item.price.currency
              ? Number(shipping.value)
              : null,
          country: item.itemLocation?.country ?? null,
          condition: item.condition ?? "Not specified",
          url: target,
          affiliate,
        },
      ];
    }),
  };
}
