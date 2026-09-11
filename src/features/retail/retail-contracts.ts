import { z } from "zod";
export const retailRequestSchema = z
  .object({
    query: z.string().trim().min(3).max(100),
    market: z.enum(["DE", "GB", "FR", "IT", "ES", "US"]),
    destination: z.enum(["DE", "AT", "FR", "IT", "ES", "NL", "BE", "GB", "US"]),
    page: z.number().int().min(0).max(9).default(0),
  })
  .strict();
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
};
export type RetailResponse = {
  source: "ebay";
  checkedAt: string;
  items: RetailItem[];
  hasMore: boolean;
  warning: string;
};
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

export function ebaySearchUrl(input: Pick<RetailRequest, "query" | "market">) {
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
  return url.href;
}
