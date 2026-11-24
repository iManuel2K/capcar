import { z } from "zod";

export const SERVICE_REVIEW_MAX_PHOTOS = 3;
export const SERVICE_REVIEW_MAX_PHOTO_BASE64 = 1_000_000;
export const SERVICE_REVIEW_MAX_BODY_BYTES = 3_100_000;
export const SERVICE_REVIEW_MAX_IMAGE_EDGE = 2_048;
export const SERVICE_REVIEW_MAX_MILEAGE = 2_000_000;

const reviewDate = z.iso.date().refine((date) => date >= "1886-01-01");
const mileage = z.number().int().min(0).max(SERVICE_REVIEW_MAX_MILEAGE);
const taskKey = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9-]+$/);
const shortText = z.string().trim().min(1).max(80);

export const serviceReviewRequestSchema = z
  .strictObject({
    consent: z.literal(true),
    photos: z
      .array(
        z.strictObject({
          data: z
            .string()
            .min(8)
            .max(SERVICE_REVIEW_MAX_PHOTO_BASE64)
            .refine(
              (value) =>
                value.startsWith("/9j/") &&
                value.length % 4 === 0 &&
                /^[a-zA-Z0-9+/]+={0,2}$/.test(value),
            ),
        }),
      )
      .min(1)
      .max(SERVICE_REVIEW_MAX_PHOTOS),
    vehicle: z.strictObject({
      year: z.number().int().min(1886).max(2100),
      make: shortText,
      model: shortText,
      engine: shortText.optional(),
      mileage: mileage.optional(),
    }),
    tasks: z
      .array(
        z.strictObject({
          key: taskKey,
          title: shortText,
          intervalMonths: z.number().int().min(1).max(240).optional(),
          intervalMileage: z.number().int().min(1).max(500_000).optional(),
          record: z.strictObject({ date: reviewDate, mileage }).optional(),
        }),
      )
      .min(1)
      .max(24)
      .refine(
        (tasks) => new Set(tasks.map((task) => task.key)).size === tasks.length,
      ),
    history: z.strictObject({ mileage, date: reviewDate }).optional(),
  })
  .readonly();

export const serviceEvidenceSchema = z.object({
  photoIndex: z
    .number()
    .int()
    .min(0)
    .max(SERVICE_REVIEW_MAX_PHOTOS - 1),
  taskKey: taskKey.nullable(),
  work: z.string().trim().min(1).max(200),
  date: reviewDate.nullable(),
  mileage: mileage.nullable(),
  excerpt: z.string().trim().min(1).max(180),
});

const serviceReviewItemSchema = z.object({
  taskKey,
  title: shortText,
  status: z.enum(["documented", "due", "unconfirmed"]),
  date: reviewDate.nullable(),
  mileage: mileage.nullable(),
  nextDueDate: reviewDate.nullable(),
  nextDueMileage: z.number().int().min(0).max(3_000_000).nullable(),
  source: z.enum(["photo", "garage"]).nullable(),
  photoIndex: z
    .number()
    .int()
    .min(0)
    .max(SERVICE_REVIEW_MAX_PHOTOS - 1)
    .nullable(),
});

export const serviceReviewResultSchema = z.object({
  evidence: z.array(serviceEvidenceSchema).max(36),
  items: z.array(serviceReviewItemSchema).max(24),
  warnings: z
    .array(
      z.enum([
        "history-mileage-conflict",
        "service-mileage-conflict",
        "unreadable-photos",
        "uncertain-service-dates",
      ]),
    )
    .max(4),
});

export type ServiceReviewRequest = z.infer<typeof serviceReviewRequestSchema>;
export type ServiceEvidence = z.infer<typeof serviceEvidenceSchema>;
export type ServiceReviewResult = z.infer<typeof serviceReviewResultSchema>;
