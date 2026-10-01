import { z } from "zod";
import { vehicleDataRequestSchema } from "@/features/vehicle-data/vehicle-data-schema";

export const retailVehicleSchema = vehicleDataRequestSchema.omit({ vin: true });

export const retailApplicabilitySchema = z
  .object({
    make: z.string().trim().min(2).max(40),
    platforms: z.string().trim().min(1).max(20).array().min(1).max(20),
    engineCodes: z.string().trim().min(1).max(30).array().min(1).max(50),
    yearFrom: z.number().int().min(1900).max(2030),
    yearTo: z.number().int().min(1900).max(2030),
    bodyStyles: z.string().trim().min(2).max(30).array().min(1).max(20),
  })
  .refine((value) => value.yearFrom <= value.yearTo, {
    message: "Check the structured fitment production range.",
  });

const vehicleMatchAxes = [
  "make",
  "platform",
  "engine",
  "production year",
  "body style",
] as const;

export const retailVehicleMatchSchema = z.object({
  status: z.enum(["exact", "mismatch", "unverified"]),
  matchedAxes: z.enum(vehicleMatchAxes).array().max(vehicleMatchAxes.length),
  mismatchedAxes: z.enum(vehicleMatchAxes).array().max(vehicleMatchAxes.length),
  source: z.enum(["structured", "none"]),
});
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
    vehicle: retailVehicleSchema.optional(),
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
export type RetailApplicability = z.infer<typeof retailApplicabilitySchema>;
export type RetailVehicleMatch = z.infer<typeof retailVehicleMatchSchema>;

const normalized = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "");

export function evaluateRetailVehicleMatch(
  vehicle: RetailRequest["vehicle"],
  applicability?: RetailApplicability,
): RetailVehicleMatch | undefined {
  if (!vehicle) return undefined;
  if (!applicability)
    return {
      status: "unverified",
      matchedAxes: [],
      mismatchedAxes: [],
      source: "none",
    };
  const checks = [
    {
      axis: "make" as const,
      matched: normalized(applicability.make) === normalized(vehicle.make),
    },
    {
      axis: "platform" as const,
      matched: applicability.platforms.some(
        (value) => normalized(value) === normalized(vehicle.platform),
      ),
    },
    {
      axis: "engine" as const,
      matched: applicability.engineCodes.some(
        (value) => normalized(value) === normalized(vehicle.engineCode),
      ),
    },
    {
      axis: "production year" as const,
      matched:
        vehicle.productionYear >= applicability.yearFrom &&
        vehicle.productionYear <= applicability.yearTo,
    },
    {
      axis: "body style" as const,
      matched: applicability.bodyStyles.some(
        (value) => normalized(value) === normalized(vehicle.bodyStyle),
      ),
    },
  ];
  const mismatchedAxes = checks
    .filter((check) => !check.matched)
    .map((check) => check.axis);
  return {
    status: mismatchedAxes.length ? "mismatch" : "exact",
    matchedAxes: checks
      .filter((check) => check.matched)
      .map((check) => check.axis),
    mismatchedAxes,
    source: "structured",
  };
}
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
  vehicleMatch?: RetailVehicleMatch;
};
export type RetailResponse = {
  source: "ebay" | "partner" | "multi";
  checkedAt: string;
  items: RetailItem[];
  hasMore: boolean;
  warning: string;
  freshness?: "live" | "stale";
  providers?: Array<{
    id: "ebay" | "partner";
    label: string;
    status: "available" | "unavailable";
    code?: "access" | "limit" | "timeout" | "unavailable";
    retryable?: boolean;
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
