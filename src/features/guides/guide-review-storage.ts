import { guideReviewRecordSchema, type GuideReviewRecord } from "@/features/guides/guide-review-schema";

export const GUIDE_REVIEW_STORAGE_KEY = "capcar.guide-reviews.v1";
export const GUIDE_REVIEW_STORAGE_EVENT = "capcar:guide-reviews-changed";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readGuideReviews(storage: ReadableStorage): GuideReviewRecord[] {
  const raw = storage.getItem(GUIDE_REVIEW_STORAGE_KEY);
  if (!raw) return [];
  try {
    const result = guideReviewRecordSchema.array().safeParse(JSON.parse(raw));
    return result.success ? result.data.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
  } catch {
    return [];
  }
}

export function saveGuideReview(
  input: Omit<GuideReviewRecord, "id" | "createdAt" | "evidenceState">,
  storage: WritableStorage,
  now = new Date().toISOString(),
): GuideReviewRecord {
  const review = guideReviewRecordSchema.parse({
    ...input,
    id: crypto.randomUUID(),
    evidenceState: "local-demo",
    createdAt: now,
  });
  storage.setItem(GUIDE_REVIEW_STORAGE_KEY, JSON.stringify([review, ...readGuideReviews(storage)]));
  return review;
}

export function announceGuideReviewChange() {
  window.dispatchEvent(new Event(GUIDE_REVIEW_STORAGE_EVENT));
}
