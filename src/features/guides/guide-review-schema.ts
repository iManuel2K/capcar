import { z } from "zod";

export const guideReviewerRoleSchema = z.enum([
  "mechanic",
  "technical-editor",
  "publisher",
]);

export const guideReviewRecordSchema = z.object({
  id: z.string().min(1),
  guideSlug: z.string().min(1),
  guideRevision: z.string().min(1),
  reviewerName: z.string().trim().min(2).max(100),
  reviewerRole: guideReviewerRoleSchema,
  outcome: z.enum(["changes-requested", "approved"]),
  sourceChecked: z.boolean(),
  applicabilityChecked: z.boolean(),
  safetyChecked: z.boolean(),
  notes: z.string().trim().max(2_000),
  evidenceState: z.enum(["local-demo", "authenticated"]),
  createdAt: z.string().datetime(),
});

export type GuideReviewRecord = z.infer<typeof guideReviewRecordSchema>;
export type GuideReviewerRole = z.infer<typeof guideReviewerRoleSchema>;
