import { z } from "zod";

export const reviewFocuses = [
  "awareness",
  "space",
  "smoothness",
  "planning",
] as const;
export const focusSchema = z.enum(reviewFocuses);
export const speedUnits = ["km/h", "mph"] as const;
export const maxReviewMoments = 4;
export const maxReviewSpeed = 400;
const clipTimeSchema = z.number().finite().min(0).max(60);
export const clipDurationSchema = z.number().finite().min(1).max(60);

export const reviewContextSchema = z
  .object({
    roadConditions: z.string().trim().min(1).max(160).optional(),
    moments: z
      .array(
        z
          .object({
            time: clipTimeSchema,
            speed: z
              .object({
                value: z.number().finite().min(0).max(maxReviewSpeed),
                unit: z.enum(speedUnits),
              })
              .strict()
              .optional(),
            note: z.string().trim().min(1).max(200).optional(),
          })
          .strict(),
      )
      .max(maxReviewMoments),
  })
  .strict();

export const frameSchema = z.object({
  time: clipTimeSchema,
  image: z
    .string()
    .max(180_000)
    .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/),
});
export const drivingReviewRequestSchema = z
  .object({
    consent: z.literal(true),
    locale: z.enum(["en", "de", "el", "sq", "ja"]),
    duration: clipDurationSchema,
    frames: z.array(frameSchema).min(2).max(12),
    focus: focusSchema,
    preferences: z.array(focusSchema).max(4).default([]),
    context: reviewContextSchema.optional(),
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
    if (data.context?.moments.some((moment) => moment.time > data.duration)) {
      ctx.addIssue({
        code: "custom",
        path: ["context", "moments"],
        message: "Supporting details must be within the clip.",
      });
    }
  });

const findingKinds = ["strength", "improvement"] as const;
const frameIndexSchema = z.number().int().min(1).max(12);
const explanationSchema = z.string().trim().min(1).max(300);
const tipSchema = z.object({
  frame: frameIndexSchema,
  relatedFrame: frameIndexSchema.optional(),
  kind: z.enum(findingKinds).optional(),
  observation: z.string().trim().min(1).max(400),
  explanation: explanationSchema.optional(),
  suggestion: z.string().trim().min(1).max(400),
  confidence: z.enum(["low", "medium"]),
  focus: focusSchema,
});

// Saved reflections from before the report did not have a finding category.
export const drivingReviewSchema = z.object({
  summary: z.string().trim().min(1).max(600),
  limitations: z.array(z.string().trim().min(1).max(300)).min(1).max(5),
  tips: z.array(tipSchema).max(3),
});

export const generatedDrivingReviewSchema = drivingReviewSchema.extend({
  tips: z
    .array(
      tipSchema.extend({
        kind: z.enum(findingKinds),
        explanation: explanationSchema,
      }),
    )
    .max(3),
});

export type DrivingReviewRequest = z.infer<typeof drivingReviewRequestSchema>;
export type DrivingReview = z.infer<typeof drivingReviewSchema>;
export type ReviewFocus = z.infer<typeof focusSchema>;
export type ReviewFrame = z.infer<typeof frameSchema>;
export type ReviewContext = z.infer<typeof reviewContextSchema>;
export const reviewResponseSchema = z.object({
  review: drivingReviewSchema,
  provider: z.enum(["gemini", "openai", "anthropic"]),
});
