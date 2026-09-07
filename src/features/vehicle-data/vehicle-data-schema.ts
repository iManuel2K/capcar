import { z } from "zod";

import { bodyStyles, transmissions } from "@/features/vehicles/vehicle-schema";

export const vehicleDataRequestSchema = z.object({
  vin: z.string().trim().length(17).optional(),
  make: z.string().trim().min(2).max(40),
  model: z.string().trim().min(1).max(60),
  productionYear: z.number().int().min(2008).max(2030),
  platform: z.string().trim().min(1).max(20),
  bodyStyle: z.enum(bodyStyles),
  engineCode: z.string().trim().min(1).max(30),
  transmission: z.enum(transmissions),
});

export const resolvedVehicleDataSchema = z.object({
  provider: z.string().min(1),
  source: z.enum(["demo", "external"]),
  confidence: z.enum(["provided", "partial", "verified"]),
  resolvedAt: z.string().datetime(),
  identity: vehicleDataRequestSchema,
  bmwIdentity: z
    .object({
      vinStatus: z.enum(["missing", "format-only", "decoded"]),
      productionDate: z
        .string()
        .regex(/^\d{4}-\d{2}$/)
        .optional(),
      typeCode: z.string().min(1).max(20).optional(),
      market: z.string().min(2).max(40).optional(),
      steering: z.enum(["left", "right"]).optional(),
      fuelType: z
        .enum(["petrol", "diesel", "hybrid", "electric", "unknown"])
        .optional(),
      displacementCc: z.number().int().positive().max(10000).optional(),
      powerKw: z.number().positive().max(2000).optional(),
      transmissionCode: z.string().min(1).max(30).optional(),
      paintCode: z.string().min(1).max(30).optional(),
      optionCodes: z.array(z.string().min(1).max(20)).max(250),
      catalogVehicleId: z.string().min(1).max(120).optional(),
    })
    .default({ vinStatus: "missing", optionCodes: [] }),
  fieldSources: z
    .array(
      z.object({
        field: z.string().min(1).max(80),
        source: z.enum(["user", "vin-provider", "catalog-provider"]),
        verified: z.boolean(),
      }),
    )
    .default([]),
  evidence: z.array(z.string()),
  warnings: z.array(z.string()),
});
