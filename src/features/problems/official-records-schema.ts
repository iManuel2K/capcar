import { z } from "zod";

export const officialRecallSchema = z.object({
  campaign: z.string().regex(/^\d{2}[A-Z]\d{6}$/),
  component: z.string().min(1).max(500),
  summary: z.string().min(1).max(12000),
  consequence: z.string().max(12000),
  remedy: z.string().max(12000),
  reportedAt: z.string().max(40),
  sourceUrl: z
    .string()
    .url()
    .refine((value) => new URL(value).origin === "https://api.nhtsa.gov"),
  parkIt: z.boolean(),
  parkOutside: z.boolean(),
});
export const officialProblemResultSchema = z.object({
  profile: z.string().max(80),
  year: z.number().int(),
  status: z.enum(["available", "not-listed", "unsupported"]),
  reason: z.enum(["market", "concept", "historic", "year", "model"]).optional(),
  fetchedAt: z.iso.datetime().nullable(),
  source: z.literal("NHTSA"),
  market: z.literal("US"),
  matchedModels: z.array(z.string().max(100)).max(20),
  records: z.array(officialRecallSchema).max(200),
});
export type OfficialProblemResult = z.infer<typeof officialProblemResultSchema>;
