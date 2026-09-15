import { z } from "zod";
import { workbenchSchema } from "./build-workbench-schema";
import { buildPlanningSchema } from "./build-planning-schema";
import { safeEbayUrl } from "@/features/retail/retail-contracts";

export const buildGoals = [
  "OEM+ daily",
  "Appearance",
  "Handling",
  "Performance",
  "Track preparation",
] as const;

export const buildStatuses = ["planning", "in_progress", "complete"] as const;
export const buildStages = [
  "foundation",
  "handling",
  "appearance",
  "performance",
] as const;
export const buildItemStatuses = ["planned", "ordered", "installed"] as const;
export const buildPriorities = ["now", "next", "later"] as const;

export const buildInputSchema = z.object({
  vehicleId: z.string().min(1),
  name: z.string().trim().min(3, "Enter a build name").max(60),
  goal: z.enum(buildGoals, { error: "Select the build goal" }),
  description: z
    .string()
    .trim()
    .min(10, "Describe the direction in a little more detail")
    .max(500),
  budget: z.coerce
    .number()
    .int()
    .min(100, "Budget must be at least €100")
    .max(1_000_000),
  status: z.enum(buildStatuses).default("planning"),
});

export const buildSchema = buildInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  planning: buildPlanningSchema.optional(),
});

export const buildItemInputSchema = z.object({
  workbench: workbenchSchema.optional(),
  buildId: z.string().min(1),
  title: z.string().trim().min(2, "Enter the modification").max(100),
  note: z.string().trim().max(300).optional(),
  catalogPartId: z.string().min(1).optional(),
  stage: z.enum(buildStages, { error: "Select a build stage" }),
  priority: z.enum(buildPriorities),
  estimatedCost: z.coerce.number().int().min(0).max(1_000_000),
  status: z.enum(buildItemStatuses).default("planned"),
  selectedOfferId: z.string().min(1).optional(),
  selectedOfferUrl: z.string().max(2048).refine(safeEbayUrl).optional(),
  merchantName: z.string().min(1).optional(),
  deliveredPrice: z.number().min(0).max(1_000_000).optional(),
  offerSelectedAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  phaseId: z.string().min(1).max(80).optional(),
  dependsOn: z.string().min(1).array().max(20).optional(),
  targetDate: z.iso.date().optional(),
});

export const buildItemSchema = buildItemInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
});

export type BuildInput = z.input<typeof buildInputSchema>;
export type Build = z.infer<typeof buildSchema>;
export type BuildItemInput = z.input<typeof buildItemInputSchema>;
export type BuildItem = z.infer<typeof buildItemSchema>;
export type BuildStage = (typeof buildStages)[number];
export type BuildItemStatus = (typeof buildItemStatuses)[number];
