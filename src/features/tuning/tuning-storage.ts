import { z } from "zod";

import {
  tuningGoals,
  tuningExperience,
  type TuningPlan,
} from "@/features/tuning/tuning-roadmap";

export const TUNING_STORAGE_KEY = "capcar.tuning-plans.v1";
export const TUNING_STORAGE_EVENT = "capcar:tuning-plans-changed";

const tuningPlanSchema: z.ZodType<TuningPlan> = z.object({
  vehicleId: z.string().min(1),
  goal: z.enum(tuningGoals),
  experience: z.enum(tuningExperience),
  budget: z.number().int().min(500),
  generatedAt: z.string().datetime(),
  stages: z.array(
    z.object({
      id: z.string(),
      order: z.number().int(),
      title: z.string(),
      reason: z.string(),
      budget: z.number().int().min(0),
      checks: z.array(z.string()),
    }),
  ),
  warnings: z.array(z.string()),
});

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readTuningPlans(storage: ReadableStorage): TuningPlan[] {
  const raw = storage.getItem(TUNING_STORAGE_KEY);
  if (!raw) return [];
  try {
    const result = tuningPlanSchema.array().safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
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
