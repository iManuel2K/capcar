import { z } from "zod";
export function noPublicContact(value: string) {
  return !/(https?:\/\/|www\.|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i.test(
    value,
  );
}
export const listingInput = z
  .object({
    title: z.string().trim().min(5).max(120).refine(noPublicContact),
    description: z.string().trim().min(20).max(3000).refine(noPublicContact),
    city: z.string().trim().min(2).max(100).refine(noPublicContact),
    price_cents: z.number().int().min(100).max(10000000),
    condition: z.enum(["new", "used", "for-parts"]),
  })
  .strict();
const reason = z
  .object({ reason: z.string().trim().min(10).max(1000) })
  .strict();
const message = z.object({ body: z.string().trim().min(5).max(2000) }).strict();
export const actions = {
  create: listingInput,
  edit: listingInput,
  withdraw: z.object({}).strict(),
  sold: z.object({}).strict(),
  moderate: reason.extend({ status: z.enum(["published", "rejected"]) }),
  review_seller: reason,
  suspend_seller: reason,
  report: reason,
  close_report: reason,
  message,
  reply: message,
  request_stamp: z
    .object({
      vehicle_id: z.string().min(1).max(150),
      specialist_id: z.string().uuid(),
      work: z.string().trim().min(5).max(500),
      performed_on: z.iso.date(),
    })
    .strict(),
  decide_stamp: z
    .object({
      status: z.enum(["verified", "rejected"]),
      evidence: z.string().trim().min(5).max(500),
    })
    .strict(),
  revoke_stamp: z.object({}).strict(),
};
export const mutationSchema = z
  .object({
    action: z.enum(
      Object.keys(actions) as [
        keyof typeof actions,
        ...(keyof typeof actions)[],
      ],
    ),
    id: z.string().uuid().optional(),
    data: z.unknown(),
  })
  .strict()
  .superRefine((input, context) => {
    if (!["create", "request_stamp"].includes(input.action) && !input.id)
      context.addIssue({ code: "custom", message: "Record ID required" });
    if (!actions[input.action].safeParse(input.data).success)
      context.addIssue({ code: "custom", message: "Invalid action fields" });
  });
export type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  city: string;
  price_cents: number;
  condition: string;
  status: string;
  created_at: string;
};
export type CommunityRole = {
  user_id: string;
  role: string;
  display_name: string;
};
export type Stamp = {
  id: string;
  owner_id: string;
  vehicle_id: string;
  specialist_id: string;
  work: string;
  performed_on: string;
  status: string;
  evidence: string | null;
};
export type CommunityMessage = {
  id: string;
  listing_id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
};
export type Report = {
  id: string;
  listing_id: string;
  reason: string;
  closed: boolean;
};
export type CommunityData = {
  userId: string;
  listings: Listing[];
  roles: CommunityRole[];
  messages: CommunityMessage[];
  reports: Report[];
  stamps: Stamp[];
};
