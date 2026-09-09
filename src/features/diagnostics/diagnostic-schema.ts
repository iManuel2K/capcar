import { z } from "zod";

export const diagnosticSeverities = ["info", "warning", "critical"] as const;
export const diagnosticStatuses = ["open", "monitoring", "resolved"] as const;

export const diagnosticInputSchema = z.object({
  vehicleId: z.string().min(1),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[PBCU][0-9A-F]{4}$/, "Enter a DTC such as P0420"),
  title: z.string().trim().min(3).max(120),
  severity: z.enum(diagnosticSeverities),
  status: z.enum(diagnosticStatuses).default("open"),
  symptoms: z.string().trim().min(3).max(500),
  resolution: z.string().trim().max(800).optional(),
  mileage: z.coerce.number().int().min(0).max(2_000_000),
});

export const diagnosticLogSchema = diagnosticInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
  repairPlan: z
    .object({
      checks: z
        .array(
          z.object({ label: z.string().min(1).max(500), done: z.boolean() }),
        )
        .max(30),
      createdAt: z.string().datetime(),
    })
    .optional(),
});

export type DiagnosticInput = z.input<typeof diagnosticInputSchema>;
export type DiagnosticLog = z.infer<typeof diagnosticLogSchema>;
export type DiagnosticStatus = (typeof diagnosticStatuses)[number];
