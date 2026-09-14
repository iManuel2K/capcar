import { z } from "zod";

// Links are opened by the owner, never fetched by a Capcar server.
export function safeEvidenceUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      url.hostname.includes(".") &&
      !url.hostname.endsWith(".local") &&
      !/^[\d.]+$/.test(url.hostname) &&
      url.hostname !== "localhost"
    );
  } catch {
    return false;
  }
}
export const evidenceUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    safeEvidenceUrl,
    "Use a public HTTPS source URL without credentials.",
  );
export const evidenceSchema = z
  .object({
    id: z.string().uuid(),
    kind: z.enum(["manufacturer", "seller", "owner"]),
    source: z.string().trim().min(2).max(160),
    url: evidenceUrl,
    partNumber: z.string().trim().min(2).max(80),
    make: z.string().trim().min(2).max(40),
    platform: z.string().trim().min(2).max(20),
    engineCode: z.string().trim().min(2).max(20),
    bodyStyle: z.string().trim().min(2).max(30),
    transmission: z.string().trim().min(2).max(30),
    yearFrom: z.number().int().min(1900).max(2030),
    yearTo: z.number().int().min(1900).max(2030),
    verdict: z.enum(["direct", "modification", "incompatible"]),
    note: z.string().trim().min(5).max(500),
    recordedAt: z.iso.datetime(),
  })
  .refine(
    (value) => value.yearFrom <= value.yearTo,
    "Check the source production range.",
  );
const amount = z.number().finite().nonnegative().max(1e6).multipleOf(0.01);
export const quoteSchema = z.object({
  id: z.string().min(1).max(220),
  retailer: z.string().trim().min(2).max(80),
  title: z.string().trim().min(2).max(500),
  partNumber: z.string().trim().max(80),
  url: evidenceUrl,
  origin: z.enum(["ebay-live", "owner-quote"]),
  price: amount,
  shipping: amount.nullable(),
  extraCharges: amount.nullable(),
  currency: z.enum(["EUR", "GBP", "USD"]),
  condition: z.string().trim().min(1).max(80),
  destination: z.string().trim().min(2).max(80).default("Unconfirmed"),
  sellerHistory: z.string().trim().max(200),
  warranty: z.string().trim().max(200),
  returns: z.string().trim().max(200),
  delivery: z.string().trim().max(200),
  observedAt: z.iso.datetime(),
  affiliate: z.boolean(),
});
export const purchaseSchema = z
  .object({
    orderedAt: z.iso.date(),
    amount: amount,
    accounting: z.enum(["include", "already-recorded"]),
    deliveredAt: z.iso.date().optional(),
    installedAt: z.iso.date().optional(),
    mileage: z.number().int().nonnegative().max(2e6).optional(),
    installer: z.string().trim().max(100).optional(),
    refunded: amount.default(0),
    updatedAt: z.iso.datetime(),
  })
  .superRefine((value, context) => {
    if (value.deliveredAt && value.deliveredAt < value.orderedAt)
      context.addIssue({
        code: "custom",
        message: "Delivery cannot precede the order.",
      });
    if (
      value.installedAt &&
      (!value.deliveredAt || value.installedAt < value.deliveredAt)
    )
      context.addIssue({
        code: "custom",
        message: "Record delivery before installation.",
      });
    if (value.installedAt && value.mileage === undefined)
      context.addIssue({
        code: "custom",
        message: "Record installation mileage.",
      });
    if (value.refunded > value.amount)
      context.addIssue({
        code: "custom",
        message: "Refund cannot exceed the paid amount.",
      });
  });
export const recordEvidenceSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(["receipt", "photo", "approval", "work-record"]),
  label: z.string().trim().min(2).max(120),
  // An owner-visible document filename, not a publicly accessible URL.
  documentName: z
    .string()
    .trim()
    .min(2)
    .max(255)
    .refine((value) => !/[\\/]/.test(value)),
  recordedAt: z.iso.datetime(),
});
export const workbenchSchema = z.object({
  quotes: quoteSchema.array().max(12).default([]),
  selectedQuoteId: z.string().max(220).optional(),
  fitment: evidenceSchema.array().max(20).default([]),
  evidence: recordEvidenceSchema.array().max(30).default([]),
  purchase: purchaseSchema.optional(),
});
export type BuildWorkbench = z.infer<typeof workbenchSchema>;
export type BuildQuote = z.infer<typeof quoteSchema>;
export type FitmentEvidence = z.infer<typeof evidenceSchema>;
export type BuildPurchase = z.infer<typeof purchaseSchema>;
