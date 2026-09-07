import { z } from "zod";

export const costCategories = ["parts", "labor", "maintenance"] as const;

export const costEntryInputSchema = z.object({
  vehicleId: z.string().min(1),
  label: z.string().trim().min(2).max(120),
  category: z.enum(costCategories),
  amount: z.coerce.number().min(0.01).max(1_000_000),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().trim().max(300).optional(),
});

export const costEntrySchema = costEntryInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const costStateSchema = z.object({
  budgets: z.record(z.string(), z.number().min(0).max(10_000_000)),
  entries: costEntrySchema.array(),
});

export type CostCategory = (typeof costCategories)[number];
export type CostEntryInput = z.input<typeof costEntryInputSchema>;
export type CostEntry = z.infer<typeof costEntrySchema>;
export type CostState = z.infer<typeof costStateSchema>;
