import { z } from "zod";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import type { AppLocale } from "@/i18n/config";
import { tuningCopy, stageCopy, goalCopy } from "./tuning-copy";

export const tuningGoals = [
  "oem_plus",
  "appearance",
  "handling",
  "sound",
  "power",
  "comfort",
  "reliability",
  "braking",
  "touring",
  "track",
] as const;
export const tuningExperience = ["beginner", "intermediate"] as const;
export const tuningUsage = ["daily", "weekend", "track"] as const;
export const tuningPlanInputSchema = z.object({
  goal: z.enum(tuningGoals),
  experience: z.enum(tuningExperience),
  budget: z.number().int().min(500).max(100_000),
  usage: z.enum(tuningUsage).default("daily"),
  reservePercent: z
    .union([z.literal(0), z.literal(10), z.literal(20)])
    .default(10),
});
export type TuningPlanInput = z.input<typeof tuningPlanInputSchema>;
export type TuningStage = {
  id: string;
  order: number;
  title: string;
  reason: string;
  budget: number;
  checks: string[];
  dependsOn?: string[];
};
export type TuningPlan = TuningPlanInput & {
  vehicleId: string;
  generatedAt: string;
  stages: TuningStage[];
  warnings: string[];
  version?: 2;
  reserveBudget?: number;
  completedChecks?: string[];
};

export function generateTuningPlan(
  vehicle: Pick<Vehicle, "id" | "model" | "platform" | "engineCode">,
  input: TuningPlanInput,
  now = new Date().toISOString(),
  locale: AppLocale = "en",
): TuningPlan {
  const parsed = tuningPlanInputSchema.parse(input);
  const reserveBudget = Math.round(
    (parsed.budget * parsed.reservePercent) / 100,
  );
  const available = parsed.budget - reserveBudget;
  const ids = ["baseline", "safety", parsed.goal, "install", "verify"] as const;
  // Planning envelopes, not part quotes. Round the remainder into the final stage.
  const shares =
    parsed.goal === "reliability"
      ? [0.4, 0.2, 0.1, 0.2, 0.1]
      : [0.2, 0.2, 0.1, 0.4, 0.1];
  let allocated = 0;
  const stages = ids.map((id, index): TuningStage => {
    const copy = stageCopy[id];
    const budget =
      index === ids.length - 1
        ? available - allocated
        : Math.floor(available * shares[index]);
    allocated += budget;
    const checks = copy.checks.map((check) => check[locale]);
    if (id === "baseline")
      checks.push(
        tuningCopy[
          parsed.experience === "beginner"
            ? "beginnerCheck"
            : "intermediateCheck"
        ][locale],
      );
    if (id === "verify")
      checks.push(
        tuningCopy[
          parsed.usage === "track"
            ? "trackCheck"
            : parsed.usage === "weekend"
              ? "weekendCheck"
              : "dailyCheck"
        ][locale],
      );
    return {
      id,
      order: index + 1,
      title: copy.title[locale],
      reason: copy.reason[locale],
      budget,
      checks,
      dependsOn: index ? [ids[index - 1]] : [],
    };
  });
  return {
    ...parsed,
    vehicleId: vehicle.id,
    generatedAt: now,
    version: 2,
    reserveBudget,
    completedChecks: [],
    stages,
    warnings: [
      tuningCopy.scope[locale],
      tuningCopy.noClaims[locale],
      tuningCopy.specialist[locale],
    ],
  };
}

export function tuningCheckKey(stage: TuningStage, index: number) {
  return `${stage.id}:${index}`;
}
export function isStageComplete(stage: TuningStage, completed: string[]) {
  return stage.checks.every((_, index) =>
    completed.includes(tuningCheckKey(stage, index)),
  );
}

/** A user-controlled handoff: no provider call, account token or internal vehicle ID. */
export function tuningAiBrief(
  vehicle: Pick<
    Vehicle,
    "make" | "model" | "productionYear" | "platform" | "engineCode"
  >,
  plan: TuningPlan,
  locale: AppLocale,
) {
  return [
    tuningCopy.aiInstruction[locale],
    `${vehicle.productionYear} ${vehicle.make ?? ""} ${vehicle.model} · ${vehicle.platform} · ${vehicle.engineCode}`,
    `${goalCopy[plan.goal][locale]} · ${tuningCopy[plan.experience][locale]} · ${tuningCopy[plan.usage ?? "daily"][locale]}`,
    `${tuningCopy.budget[locale]}: EUR ${plan.budget}; ${tuningCopy.reserve[locale]}: EUR ${plan.reserveBudget ?? 0}`,
    ...plan.stages.map(
      (stage) =>
        `${stage.order}. ${stage.title}\n${stage.checks.map((check, i) => `${(plan.completedChecks ?? []).includes(tuningCheckKey(stage, i)) ? "[x]" : "[ ]"} ${check}`).join("\n")}`,
    ),
    ...plan.warnings,
  ].join("\n\n");
}
