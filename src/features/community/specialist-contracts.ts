import { z } from "zod";
export const specialistInput = z
  .object({
    business_name: z.string().trim().min(2).max(100),
    city: z.string().trim().min(2).max(100),
    website: z
      .string()
      .trim()
      .max(300)
      .regex(/^https:\/\/[A-Za-z0-9.-]+(:[0-9]+)?(\/[^\s]*)?$/)
      .refine((value) => {
        try {
          const url = new URL(value);
          return !!url.hostname && !url.username && !url.password;
        } catch {
          return false;
        }
      }),
    expertise: z.string().trim().min(20).max(2000),
    consent: z.literal(true),
  })
  .strict();
export const specialistMutation = z.discriminatedUnion("action", [
  z.object({ action: z.literal("apply"), data: specialistInput }).strict(),
  z
    .object({
      action: z.literal("review"),
      id: z.uuid(),
      status: z.enum(["approved", "rejected", "revoked"]),
      reason: z.string().trim().min(10).max(1000),
    })
    .strict(),
]);
export const specialistApplication = specialistInput
  .omit({ consent: true })
  .extend({
    id: z.uuid(),
    user_id: z.uuid(),
    status: z.enum(["pending", "approved", "rejected", "revoked"]),
    review_reason: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  });
export const specialistResponse = z.object({
  userId: z.uuid(),
  moderator: z.boolean(),
  applications: z.array(specialistApplication).max(101),
  page: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});
export type SpecialistResponse = z.infer<typeof specialistResponse>;
