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
type TokenEntry = { value: string; expiresAt: number; clientId: string };
let applicationToken: TokenEntry | undefined;

async function requestApplicationToken(
  clientId: string,
  clientSecret: string,
  request: typeof fetch,
) {
  if (
    applicationToken?.clientId === clientId &&
    applicationToken.expiresAt > Date.now()
  )
    return applicationToken.value;
  let response: Response;
  try {
    response = await request("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "https://api.ebay.com/oauth/api_scope",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      redirect: "error",
    });
  } catch {
    throw new RetailUnavailable(
      "eBay authorization could not be reached. Try again shortly.",
    );
  }
  if (!response.ok)
    throw new RetailUnavailable(
      "eBay rejected Capcar's production App ID or Cert ID.",
    );
  const parsed = z
    .object({
      access_token: z.string().min(1),
      expires_in: z.number().positive(),
    })
    .safeParse(await response.json().catch(() => null));
  if (!parsed.success)
    throw new RetailUnavailable(
      "eBay returned an unreadable authorization response.",
    );
  applicationToken = {
    value: parsed.data.access_token,
    clientId,
    expiresAt: Date.now() + Math.max(0, parsed.data.expires_in - 120) * 1_000,
  };
  return applicationToken.value;
}
export async function searchEbay(
  input: RetailRequest,
  env: Record<string, string | undefined> = process.env,
  request: typeof fetch = fetch,
): Promise<RetailResponse> {
  const clientId = env.CAPCAR_EBAY_CLIENT_ID?.trim();
  const clientSecret = env.CAPCAR_EBAY_CLIENT_SECRET?.trim();
  const staticToken = env.CAPCAR_EBAY_ACCESS_TOKEN?.trim();
  if (!staticToken && !(clientId && clientSecret))
    throw new RetailUnavailable("Live retailer search is not connected yet.");
  // Renewable application credentials take precedence over an expiring static token.
  const token =
    clientId && clientSecret
      ? await requestApplicationToken(clientId, clientSecret, request)
      : staticToken!;
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
  let response: Response;
  try {
    response = await request(url, {
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
  } catch {
    throw new RetailUnavailable(
      "eBay search could not be reached. Try again shortly.",
    );
  }
  if (!response.ok) {
    if (response.status === 401 && clientId) applicationToken = undefined;
    throw new RetailUnavailable(
      response.status === 401 || response.status === 403
        ? "eBay rejected Capcar's Browse API access. Check that the production keyset has Buy API access."
        : response.status === 429
          ? "eBay's current request allowance has been reached. Try again later."
          : "eBay could not complete this search. Try again shortly.",
    );
  }
  const parsedPayload = responseSchema.safeParse(
    await response.json().catch(() => null),
  );
  if (!parsedPayload.success)
    throw new RetailUnavailable(
      "eBay returned listings Capcar could not read.",
    );
  const payload = parsedPayload.data;
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
