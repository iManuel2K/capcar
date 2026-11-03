import { z } from "zod";
import { safeAuthNext } from "@/features/auth/next-path";
import {
  tuningGoals,
  tuningExperience,
  tuningUsage,
} from "@/features/tuning/tuning-roadmap";

export const copilotRequestSchema = z.object({
  intent: z.enum(["tuning_review", "tuning_prompt"]).optional(),
  tuningContext: z
    .object({
      goal: z.enum(tuningGoals),
      experience: z.enum(tuningExperience),
      usage: z.enum(tuningUsage),
      budget: z.number().int().min(500).max(100_000),
      reserveBudget: z.number().int().min(0).max(100_000),
      selectedStage: z.string().max(80).optional(),
      stages: z
        .array(
          z.object({
            id: z.string().max(80),
            title: z.string().max(200),
            budget: z.number().int().min(0).max(100_000),
            checks: z
              .array(
                z.object({ text: z.string().max(1000), done: z.boolean() }),
              )
              .max(10),
          }),
        )
        .max(6),
    })
    .optional(),
  locale: z.enum(["en", "de", "el", "sq", "ja"]).optional(),
  history: z
    .array(
      z.object({
        question: z.string().max(1000),
        answer: z.string().max(6000),
      }),
    )
    .max(8)
    .optional(),
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
    z.object({
      label: z.string(),
      href: z.string().refine((value) => Boolean(safeAuthNext(value, "")), {
        message: "Copilot actions must link to a safe same-site path.",
      }),
    }),
  ),
});

export type CopilotRequest = z.infer<typeof copilotRequestSchema>;
export type CopilotResponse = z.infer<typeof copilotResponseSchema>;
