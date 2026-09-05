import { z } from "zod";

import { vehicleDataRequestSchema } from "@/features/vehicle-data/vehicle-data-schema";

export const vehicleModelRequestSchema = z.object({
  vehicle: vehicleDataRequestSchema,
});

const vectorSchema = z.tuple([z.number(), z.number(), z.number()]);
const faceSchema = z.object({
  indices: z.array(z.number().int().nonnegative()).min(3).max(8),
  material: z.enum(["body", "glass", "trim", "light-front", "light-rear"]),
});

export const vehicleModelSchema = z.object({
  provider: z.string().min(1),
  source: z.enum(["demo", "external"]),
  accuracy: z.enum(["concept", "reference", "dimensionally-verified"]),
  assetId: z.string().min(1),
  vehicleKey: z.string().min(1),
  revision: z.string().min(1),
  coordinateUnit: z.literal("mm"),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    wheelbase: z.number().positive(),
    trackFront: z.number().positive(),
    trackRear: z.number().positive(),
    referenceWheelDiameter: z.number().positive(),
  }),
  vertices: z.array(vectorSchema).min(8).max(20_000),
  faces: z.array(faceSchema).min(6).max(40_000),
  mappedSlots: z.array(
    z.enum([
      "paint",
      "front-wheels",
      "rear-wheels",
      "stance",
      "lighting",
      "aero",
    ]),
  ),
  license: z.object({
    commercialUse: z.boolean(),
    attribution: z.string().optional(),
  }),
  warnings: z.array(z.string()),
});

export type VehicleModelRequest = z.infer<typeof vehicleModelRequestSchema>;
export type VehicleModel = z.infer<typeof vehicleModelSchema>;
export type VehicleModelFace = VehicleModel["faces"][number];
export type Vector3 = z.infer<typeof vectorSchema>;
