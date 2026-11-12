import { z } from "zod";

import {
  tuningGoals,
  tuningExperience,
  tuningUsage,
  isStageComplete,
  tuningCheckKey,
  type TuningPlan,
} from "@/features/tuning/tuning-roadmap";

export const TUNING_STORAGE_KEY = "capcar.tuning-plans.v1";
export const TUNING_STORAGE_EVENT = "capcar:tuning-plans-changed";

const tuningPlanSchema: z.ZodType<TuningPlan> = z.object({
  vehicleId: z.string().min(1),
  goal: z.enum(tuningGoals),
  experience: z.enum(tuningExperience),
  budget: z.number().int().min(500).max(100_000),
  usage: z.enum(tuningUsage).optional(),
  reservePercent: z
    .union([z.literal(0), z.literal(10), z.literal(20)])
    .optional(),
  version: z.literal(2).optional(),
  reserveBudget: z.number().int().min(0).optional(),
  completedChecks: z.array(z.string()).optional(),
  generatedAt: z.string().datetime(),
  stages: z.array(
    z.object({
      id: z.string(),
      order: z.number().int(),
      title: z.string(),
      reason: z.string(),
      budget: z.number().int().min(0),
      checks: z.array(z.string()),
      dependsOn: z.array(z.string()).optional(),
    }),
  ),
  warnings: z.array(z.string()),
});

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readTuningPlans(storage: ReadableStorage): TuningPlan[] {
  try {
    const raw = storage.getItem(TUNING_STORAGE_KEY);
    if (!raw) return [];
    const entries: unknown = JSON.parse(raw);
    if (!Array.isArray(entries)) return [];
    return entries.flatMap((entry) => {
      const result = tuningPlanSchema.safeParse(entry);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

export function updateTuningCheck(
  vehicleId: string,
  generatedAt: string,
  stageId: string,
  index: number,
  checked: boolean,
  storage: WritableStorage,
) {
  // Read the latest snapshot so another tab's progress is not overwritten.
  const plan = readTuningPlans(storage).find(
    (candidate) => candidate.vehicleId === vehicleId,
  );
  if (!plan || plan.generatedAt !== generatedAt)
    throw new Error("Roadmap changed; reopen the saved plan.");
  const stageIndex = plan.stages.findIndex((stage) => stage.id === stageId);
  const stage = plan.stages[stageIndex];
  if (
    !stage ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= stage.checks.length
  )
    throw new Error("Unknown check.");
  let completed = plan.completedChecks ?? [];
  if (
    checked &&
    plan.stages
      .slice(0, stageIndex)
      .some((previous) => !isStageComplete(previous, completed))
  ) {
    throw new Error("Complete earlier steps first.");
  }
  const key = tuningCheckKey(stage, index);
  completed = completed.filter((candidate) => candidate !== key);
  if (checked) completed.push(key);
  else {
    const later = new Set(
      plan.stages
        .slice(stageIndex + 1)
        .flatMap((item) => item.checks.map((_, i) => tuningCheckKey(item, i))),
    );
    completed = completed.filter((candidate) => !later.has(candidate));
  }
  return saveTuningPlan({ ...plan, completedChecks: completed }, storage);
}

export function saveTuningPlan(plan: TuningPlan, storage: WritableStorage) {
  const valid = tuningPlanSchema.parse(plan);
  const others = readTuningPlans(storage).filter(
    (candidate) => candidate.vehicleId !== valid.vehicleId,
  );
  storage.setItem(TUNING_STORAGE_KEY, JSON.stringify([valid, ...others]));
  return valid;
}

export function announceTuningChange() {
  window.dispatchEvent(new Event(TUNING_STORAGE_EVENT));
}
