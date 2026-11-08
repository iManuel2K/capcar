import { z } from "zod";

export const reviewFocuses = [
  "awareness",
  "space",
  "smoothness",
  "planning",
] as const;
export const focusSchema = z.enum(reviewFocuses);
export const frameSchema = z.object({
  time: z.number().finite().min(0).max(60),
  image: z
    .string()
    .max(180_000)
    .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/),
});
export const drivingReviewRequestSchema = z
  .object({
    consent: z.literal(true),
    locale: z.enum(["en", "de", "el", "sq", "ja"]),
    duration: z.number().finite().min(1).max(60),
    frames: z.array(frameSchema).min(2).max(12),
    focus: focusSchema,
    preferences: z.array(focusSchema).max(4).default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.frames.some(
        (frame, i) =>
          frame.time > data.duration ||
          (i > 0 && frame.time <= data.frames[i - 1].time),
      )
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["frames"],
        message: "Frames must be chronological and within the clip.",
      });
    }
  });
export const drivingReviewSchema = z.object({
  summary: z.string().trim().min(1).max(600),
  limitations: z.array(z.string().trim().min(1).max(300)).min(1).max(5),
  tips: z
    .array(
      z.object({
        frame: z.number().int().min(1).max(12),
        observation: z.string().trim().min(1).max(400),
        suggestion: z.string().trim().min(1).max(400),
        confidence: z.enum(["low", "medium"]),
        focus: focusSchema,
      }),
    )
    .max(3),
});
export type DrivingReviewRequest = z.infer<typeof drivingReviewRequestSchema>;
export type DrivingReview = z.infer<typeof drivingReviewSchema>;
export type ReviewFocus = z.infer<typeof focusSchema>;
export type ReviewFrame = z.infer<typeof frameSchema>;
export const reviewResponseSchema = z.object({
  review: drivingReviewSchema,
  provider: z.enum(["gemini", "openai", "anthropic"]),
});
