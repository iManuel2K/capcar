import { z } from "zod";
export const retailRequestSchema = z
  .object({
    query: z.string().trim().min(3).max(100),
    market: z.enum(["DE", "GB", "FR", "IT", "ES", "US"]),
    destination: z.enum(["DE", "AT", "FR", "IT", "ES", "NL", "BE", "GB", "US"]),
    condition: z.enum(["all", "new", "used", "parts"]).default("all"),
    sort: z
      .enum(["bestMatch", "priceAsc", "priceDesc", "newest"])
      .default("bestMatch"),
    minPrice: z.number().finite().nonnegative().max(1_000_000).optional(),
    maxPrice: z.number().finite().nonnegative().max(1_000_000).optional(),
    page: z.number().int().min(0).max(9).default(0),
  })
  .strict()
  .refine(
    ({ minPrice, maxPrice }) =>
      minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice,
    {
      message: "Minimum price cannot exceed maximum price.",
      path: ["minPrice"],
    },
  );
export type RetailRequest = z.infer<typeof retailRequestSchema>;
export type RetailItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  shipping: number | null;
  country: string | null;
  condition: string;
  url: string;
  affiliate: boolean;
  retailer?: string;
  provider?: "ebay" | "partner";
  providerItemId?: string;
};
export type RetailResponse = {
  source: "ebay" | "partner" | "multi";
  checkedAt: string;
  items: RetailItem[];
  hasMore: boolean;
  warning: string;
  providers?: Array<{
    id: "ebay" | "partner";
    label: string;
    status: "available" | "unavailable";
  }>;
};
export function safeRetailUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      url.hostname.includes(".") &&
      url.hostname !== "localhost" &&
      !url.hostname.endsWith(".local") &&
      !/^(127\.|10\.|192\.168\.|169\.254\.)/.test(url.hostname)
    );
  } catch {
    return false;
  }
}
export function safeEbayUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      [
        "ebay.de",
        "ebay.com",
        "ebay.co.uk",
        "ebay.fr",
        "ebay.it",
        "ebay.es",
        "ebay.at",
        "ebay.nl",
        "ebay.be",
      ].some((host) => url.hostname === host || url.hostname === `www.${host}`)
    );
  } catch {
    return false;
  }
}

type EbaySearchLinkInput = Pick<RetailRequest, "query" | "market"> &
  Partial<Pick<RetailRequest, "condition" | "sort" | "minPrice" | "maxPrice">>;

export function ebaySearchUrl(input: EbaySearchLinkInput) {
  const hosts: Record<RetailRequest["market"], string> = {
    DE: "www.ebay.de",
    GB: "www.ebay.co.uk",
    FR: "www.ebay.fr",
    IT: "www.ebay.it",
    ES: "www.ebay.es",
    US: "www.ebay.com",
  };
  const url = new URL(`https://${hosts[input.market]}/sch/i.html`);
  url.searchParams.set("_nkw", input.query.trim());
  const conditionIds = { new: "1000", used: "3000", parts: "7000" };
  if (input.condition && input.condition !== "all")
    url.searchParams.set("LH_ItemCondition", conditionIds[input.condition]);
  if (input.minPrice !== undefined)
    url.searchParams.set("_udlo", String(input.minPrice));
  if (input.maxPrice !== undefined)
    url.searchParams.set("_udhi", String(input.maxPrice));
  const sortCodes = { priceAsc: "15", priceDesc: "16", newest: "10" };
  if (input.sort && input.sort !== "bestMatch")
    url.searchParams.set("_sop", sortCodes[input.sort]);
  return url.href;
}
