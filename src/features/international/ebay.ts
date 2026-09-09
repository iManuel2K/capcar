// Import only from server routes. Credentials never enter client props or responses.
import { z } from "zod";
import {
  demoSearch,
  ebayParams,
  inRegion,
  rank,
  type Listing,
  type SearchRequest,
  type SearchResult,
} from "./search";

const money = z.object({
  value: z.string().regex(/^\d+(\.\d+)?$/),
  currency: z.string().regex(/^[A-Z]{3}$/),
});
const responseSchema = z.object({
  itemSummaries: z
    .array(
      z.object({
        itemId: z.string(),
        title: z.string(),
        price: money,
        itemLocation: z.object({ country: z.string().optional() }).optional(),
        condition: z.string().optional(),
        itemWebUrl: z.string().optional(),
        seller: z
          .object({
            username: z.string(),
            feedbackPercentage: z.string().optional(),
          })
          .optional(),
        shippingOptions: z
          .array(z.object({ shippingCost: money.optional() }))
          .optional(),
      }),
    )
    .default([]),
});
let token: { value: string; expires: number; clientId: string } | undefined;
async function accessToken(id: string, secret: string) {
  if (token && token.clientId === id && token.expires > Date.now())
    return token.value;
  const response = await fetch(
    "https://api.ebay.com/identity/v1/oauth2/token",
    {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "https://api.ebay.com/oauth/api_scope",
      }),
    },
  );
  if (!response.ok)
    throw new Error(
      "eBay authorization unavailable. Check production access and server credentials.",
    );
  const result = z
    .object({
      access_token: z.string().min(1),
      expires_in: z.number().positive(),
    })
    .parse(await response.json());
  token = {
    value: result.access_token,
    clientId: id,
    expires: Date.now() + Math.max(0, result.expires_in - 120) * 1000,
  };
  return token.value;
}
function safeLink(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      /(^|\.)ebay\.(de|com|co\.uk|fr|it|es|at|nl|ch)$/.test(url.hostname)
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
export async function searchInternational(
  input: SearchRequest,
  env: Record<string, string | undefined> = process.env,
): Promise<SearchResult> {
  if (env.CAPCAR_EBAY_MODE !== "live") return demoSearch(input);
  if (!env.CAPCAR_EBAY_CLIENT_ID || !env.CAPCAR_EBAY_CLIENT_SECRET)
    throw new Error(
      "Live eBay search is selected but credentials are missing.",
    );
  const access = await accessToken(
    env.CAPCAR_EBAY_CLIENT_ID,
    env.CAPCAR_EBAY_CLIENT_SECRET,
  );
  const response = await fetch(
    `https://api.ebay.com/buy/browse/v1/item_summary/search?${ebayParams(input)}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${access}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_DE",
        "X-EBAY-C-ENDUSERCTX": `contextualLocation=${encodeURIComponent(`country=${input.destination},zip=${input.postcode}`)}`,
      },
    },
  );
  if (!response.ok)
    throw new Error(
      "eBay search unavailable. Check API access or try again later.",
    );
  const payload = responseSchema.parse(await response.json());
  const items: Listing[] = payload.itemSummaries
    .filter((item) => inRegion(item.itemLocation?.country, input.region))
    .map((item) => {
      const shipping =
        item.shippingOptions?.flatMap((option) =>
          option.shippingCost?.currency === item.price.currency
            ? [Number(option.shippingCost.value)]
            : [],
        ) ?? [];
      return {
        id: item.itemId,
        title: item.title,
        country: item.itemLocation?.country,
        price: Number(item.price.value),
        currency: item.price.currency,
        shipping: shipping.length ? Math.min(...shipping) : null,
        condition: item.condition ?? "Unknown",
        seller: item.seller?.username ?? "Unknown",
        feedback: item.seller?.feedbackPercentage,
        url: safeLink(item.itemWebUrl),
      };
    });
  return {
    mode: "live",
    items: rank(items),
    checkedAt: new Date().toISOString(),
    note: "eBay Germany marketplace: up to 50 matching listings, then item-location filtering. Not exhaustive worldwide coverage. Subtotals exclude unknown import charges; confirm shipping, condition, returns and fitment with the seller.",
  };
}
