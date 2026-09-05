import { z } from "zod";

export const GUIDE_PROGRESS_KEY = "capcar.guides.v1";
export const GUIDE_PROGRESS_EVENT = "capcar:guides-changed";

const guideProgressSchema = z.object({
  vehicleId: z.string().min(1),
  guideSlug: z.string().min(1),
  mode: z.enum(["beginner", "expert"]),
  safetyAccepted: z.boolean(),
  completedSteps: z.array(z.string()),
  completedAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime(),
});

export type GuideProgress = z.infer<typeof guideProgressSchema>;
type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readGuideProgress(storage: ReadableStorage): GuideProgress[] {
  const raw = storage.getItem(GUIDE_PROGRESS_KEY);
  if (!raw) return [];
  try {
    const result = guideProgressSchema.array().safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function getGuideProgress(
  vehicleId: string,
  guideSlug: string,
  storage: ReadableStorage,
) {
  return readGuideProgress(storage).find(
    (record) =>
      record.vehicleId === vehicleId && record.guideSlug === guideSlug,
  );
}

export function saveGuideProgress(
  input: Omit<GuideProgress, "updatedAt"> & { updatedAt?: string },
  storage: WritableStorage,
  now = new Date().toISOString(),
) {
  const record = guideProgressSchema.parse({ ...input, updatedAt: now });
  const other = readGuideProgress(storage).filter(
    (candidate) =>
      !(
        candidate.vehicleId === record.vehicleId &&
        candidate.guideSlug === record.guideSlug
      ),
  );
  storage.setItem(GUIDE_PROGRESS_KEY, JSON.stringify([record, ...other]));
  return record;
}

export function announceGuideProgressChange() {
  window.dispatchEvent(new Event(GUIDE_PROGRESS_EVENT));
}
