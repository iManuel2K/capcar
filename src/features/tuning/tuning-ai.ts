import type { CopilotRequest } from "@/features/copilot/copilot-schema";
import { tuningCheckKey, type TuningPlan } from "./tuning-roadmap";

export function tuningAiContext(
  plan: TuningPlan,
  selectedStage?: string,
): NonNullable<CopilotRequest["tuningContext"]> {
  return {
    goal: plan.goal,
    experience: plan.experience,
    usage: plan.usage ?? "daily",
    budget: plan.budget,
    reserveBudget: plan.reserveBudget ?? 0,
    selectedStage: plan.stages.some((stage) => stage.id === selectedStage)
      ? selectedStage
      : undefined,
    stages: plan.stages.map((stage) => ({
      id: stage.id,
      title: stage.title,
      budget: stage.budget,
      checks: stage.checks.map((text, index) => ({
        text,
        done: (plan.completedChecks ?? []).includes(
          tuningCheckKey(stage, index),
        ),
      })),
    })),
  };
}
