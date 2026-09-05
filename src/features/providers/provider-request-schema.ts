import { z } from "zod";

import { partCategories } from "@/features/parts/part-catalog";
import { vehicleDataRequestSchema } from "@/features/vehicle-data/vehicle-data-schema";

export const partSearchRequestSchema = z.object({
  vehicle: vehicleDataRequestSchema,
  query: z.string().trim().max(100).optional(),
  category: z.enum(["All", ...partCategories]).optional(),
});

export const offerSearchRequestSchema = z.object({
  partId: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(1).max(20).default(1),
  destinationCountry: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase())
    .default("DE"),
  currency: z.literal("EUR").default("EUR"),
});
