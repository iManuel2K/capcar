import { z } from "zod";

const date = z.iso.date();

export const buildPhaseSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().trim().min(2).max(60),
  order: z.number().int().min(0).max(50),
  budget: z.number().int().nonnegative().max(1_000_000),
  targetDate: date.optional(),
});

export const buildPlanningSchema = z
  .object({
    version: z.literal(1).default(1),
    phases: buildPhaseSchema.array().min(1).max(12),
    currentPhaseId: z.string().min(1).max(80),
  })
  .superRefine((value, context) => {
    const ids = value.phases.map((phase) => phase.id);
    if (new Set(ids).size !== ids.length)
      context.addIssue({
        code: "custom",
        message: "Phase IDs must be unique.",
      });
    if (!ids.includes(value.currentPhaseId))
      context.addIssue({
        code: "custom",
        message: "The current phase must belong to this build.",
      });
  });

export type BuildPhase = z.infer<typeof buildPhaseSchema>;
export type BuildPlanning = z.infer<typeof buildPlanningSchema>;
