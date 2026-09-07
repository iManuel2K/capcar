import { z } from "zod";

export const copilotRequestSchema = z.object({
  message: z.string().trim().min(2).max(1000),
  vehicle: z.object({
    id: z.string(),
    make: z.string().optional(),
    model: z.string(),
    productionYear: z.number().int(),
    platform: z.string(),
    engineCode: z.string(),
    mileage: z.number().int(),
  }),
  buildItems: z
    .array(
      z.object({
        title: z.string(),
        stage: z.string(),
        status: z.string(),
        catalogPartId: z.string().optional(),
      }),
    )
    .max(100),
});

export const copilotResponseSchema = z.object({
  provider: z.string(),
  source: z.enum(["deterministic", "external"]),
  answer: z.string(),
  evidence: z.array(z.string()),
  warnings: z.array(z.string()),
  nextActions: z.array(
    z.object({ label: z.string(), href: z.string().startsWith("/") }),
  ),
});

export type CopilotRequest = z.infer<typeof copilotRequestSchema>;
export type CopilotResponse = z.infer<typeof copilotResponseSchema>;
