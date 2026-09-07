import { z } from "zod";

export const requestSchema = z.object({
  query: z.string().trim().min(2).max(100),
  region: z.enum(["DE", "EU", "EUROPE", "WORLD"]).default("DE"),
  destination: z.enum(["DE", "AT", "FR", "NL", "IT", "ES", "PL", "GB", "CH"]).default("DE"),
  postcode: z.string().trim().regex(/^[A-Za-z0-9 -]{2,12}$/),
  condition: z.enum(["ALL", "NEW", "USED"]).default("ALL"),
});
export type SearchRequest = z.infer<typeof requestSchema>;
export const eu = "AT BE BG HR CY CZ DE DK EE ES FI FR GR HU IE IT LT LU LV MT NL PL PT RO SE SI SK".split(" ");
const europe = [...eu, ..."GB CH NO IS LI AL AD BA BY MD ME MK MC RS SM UA VA TR RU".split(" ")];
export function inRegion(country: string | undefined, region: SearchRequest["region"]) {
  if (region === "WORLD") return true;
  if (!country) return false;
  return (region === "DE" ? ["DE"] : region === "EU" ? eu : europe).includes(country);
}
export type Listing = {
  id: string; title: string; country?: string; condition: string;
  price: number; currency: string; shipping: number | null;
  seller: string; feedback?: string; url?: string;
};
export type SearchResult = { mode: "demo" | "live"; items: Listing[]; checkedAt: string; note: string };
export function subtotal(item: Listing) { return item.shipping === null ? null : Math.round((item.price + item.shipping) * 100) / 100; }
export function rank(items: Listing[]) {
  return [...items].sort((a, b) => {
    // Currency groups are deliberately not compared without an FX source.
    if (a.currency !== b.currency) return a.currency.localeCompare(b.currency);
    return (subtotal(a) ?? Infinity) - (subtotal(b) ?? Infinity);
  });
}
export function demoSearch(input: SearchRequest): SearchResult {
  const items: Listing[] = ["DE", "PL", "FR", "GB", "US"].map((country, index) => ({
    id: `demo-${country}`, title: `Demo concept: ${input.query}`, country,
    condition: index % 2 ? "USED" : "NEW", price: 100 + index * 12,
    currency: "EUR", shipping: index === 4 ? null : index * 8,
    seller: `Fictional seller ${index + 1}`,
  }));
  return { mode: "demo", checkedAt: new Date().toISOString(), items: rank(items.filter(item => inRegion(item.country, input.region) && (input.condition === "ALL" || item.condition === input.condition))), note: "Fictional offers for testing filters only. No live listings or verified shipping/fitment." };
}
export function ebayParams(input: SearchRequest) {
  const filters = [`deliveryCountry:${input.destination}`, `deliveryPostalCode:${input.postcode}`];
  if (input.region === "DE") filters.push("itemLocationCountry:DE");
  if (input.condition !== "ALL") filters.push(`conditions:{${input.condition}}`);
  return new URLSearchParams({ q: input.query, limit: "50", filter: filters.join(",") });
}
