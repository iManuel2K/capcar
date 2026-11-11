import { z } from "zod";
import {
  clipDurationSchema,
  drivingReviewSchema,
  focusSchema,
  reviewContextSchema,
} from "./contracts";

export const DRIVING_REVIEW_KEY = "capcar.driving-reviews.v1";
export const DRIVING_REVIEW_EVENT = "capcar:driving-reviews-changed";
export const savedReviewSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  provider: z.enum(["gemini", "openai", "anthropic"]),
  frameTimes: z.array(z.number().min(0).max(60)).min(2).max(12),
  duration: clipDurationSchema.optional(),
  context: reviewContextSchema.optional(),
  review: drivingReviewSchema,
});
export const drivingProfileSchema = z.object({
  vehicleId: z.string().min(1).max(100),
  learning: z.boolean(),
  preferences: z.array(focusSchema).max(4),
  reviews: z.array(savedReviewSchema).max(20),
});
export type DrivingProfile = z.infer<typeof drivingProfileSchema>;
export type SavedDrivingReview = z.infer<typeof savedReviewSchema>;
type Store = Pick<Storage, "getItem" | "setItem">;
export function readDrivingProfiles(
  storage: Pick<Storage, "getItem">,
): DrivingProfile[] {
  try {
    return drivingProfileSchema
      .array()
      .max(100)
      .parse(JSON.parse(storage.getItem(DRIVING_REVIEW_KEY) ?? "[]"));
  } catch {
    return [];
  }
}
export function emptyDrivingProfile(vehicleId: string): DrivingProfile {
  return { vehicleId, learning: false, preferences: [], reviews: [] };
}
export function saveDrivingProfile(profile: DrivingProfile, storage: Store) {
  const valid = drivingProfileSchema.parse(profile);
  const profiles = readDrivingProfiles(storage).filter(
    (item) => item.vehicleId !== valid.vehicleId,
  );
  if (profiles.length >= 100) throw new Error("Profile limit reached");
  // Strict schema drops raw clips, image data, names and arbitrary properties.
  storage.setItem(DRIVING_REVIEW_KEY, JSON.stringify([...profiles, valid]));
}
export function saveDrivingResult(
  profile: DrivingProfile,
  result: SavedDrivingReview,
): DrivingProfile {
  return {
    ...profile,
    reviews: [
      savedReviewSchema.parse(result),
      ...profile.reviews.filter((item) => item.id !== result.id),
    ].slice(0, 20),
  };
}
