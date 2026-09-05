import { z } from "zod";

import { buildStages } from "@/features/builds/build-schema";
import { partCategories } from "@/features/parts/part-catalog";

const fitmentRuleSchema = z.object({
  platforms: z.array(z.string()),
  yearFrom: z.number().int().optional(),
  yearTo: z.number().int().optional(),
  bodyStyles: z.array(z.string()).optional(),
  engineCodes: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
});

const catalogPartSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  partNumber: z.string().min(1),
  category: z.enum(partCategories),
  quality: z.enum(["Value", "OEM style", "Performance", "Premium"]),
  summary: z.string(),
  estimatedPrice: z.number().min(0),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]),
  installationMinutes: z.number().int().min(0),
  buildStage: z.enum(buildStages),
  fitmentRules: z.array(fitmentRuleSchema),
  requiredItems: z.array(z.string()),
  documents: z.array(z.string()),
});

const fitmentResultSchema = z.object({
  status: z.enum(["match", "conditional", "unverified", "mismatch"]),
  label: z.string(),
  checks: z.array(
    z.object({
      label: z.string(),
      expected: z.string(),
      actual: z.string(),
      matched: z.boolean(),
    }),
  ),
  conditions: z.array(z.string()),
});

export const partSearchResponseSchema = z.object({
  provider: z.string().min(1),
  source: z.enum(["demo", "external"]),
  results: z.array(
    z.object({ part: catalogPartSchema, fitment: fitmentResultSchema }),
  ),
  warnings: z.array(z.string()),
});

const rankedOfferSchema = z.object({
  id: z.string().min(1),
  partId: z.string().min(1),
  merchantName: z.string().min(1),
  productPrice: z.number().min(0),
  shippingPrice: z.number().min(0),
  deliveryDays: z.number().int().min(0),
  sellerRating: z.number().min(0).max(5),
  condition: z.enum(["New", "Remanufactured"]),
  warrantyMonths: z.number().int().min(0),
  returnsDays: z.number().int().min(0),
  quantity: z.number().int().min(1),
  subtotal: z.number().min(0),
  requiredExtrasPrice: z.number().min(0),
  estimatedFees: z.number().min(0),
  availability: z.enum(["in-stock", "limited", "backorder", "unknown"]),
  taxIncluded: z.boolean(),
  priceCheckedAt: z.string().datetime(),
  purchaseUrl: z.string().url().startsWith("https://").optional(),
  deliveredTotal: z.number().min(0),
  isCheapest: z.boolean(),
  isBestValue: z.boolean(),
});

export const offerSearchResponseSchema = z.object({
  provider: z.string().min(1),
  source: z.enum(["demo", "external"]),
  partId: z.string().min(1),
  offers: z.array(rankedOfferSchema),
  searchedAt: z.string().datetime(),
  destinationCountry: z.string().length(2),
  currency: z.literal("EUR"),
  warnings: z.array(z.string()),
});
