import { z } from "zod";

import { vehicleDataRequestSchema } from "@/features/vehicle-data/vehicle-data-schema";

export const vehicleModelRequestSchema = z.object({
  vehicle: vehicleDataRequestSchema,
});

const vectorSchema = z.tuple([z.number(), z.number(), z.number()]);
const assetUrlSchema = z.string().refine((value) => {
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}, "Use a same-origin path or credential-free HTTPS asset URL.");
const faceSchema = z.object({
  indices: z.array(z.number().int().nonnegative()).min(3).max(8),
  material: z.enum(["body", "glass", "trim", "light-front", "light-rear"]),
});

export const vehicleModelSchema = z
  .object({
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
    vertices: z.array(vectorSchema).max(20_000).default([]),
    faces: z.array(faceSchema).max(40_000).default([]),
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
      name: z.string().max(120).optional(),
      sourceUrl: assetUrlSchema.optional(),
    }),
    delivery: z
      .object({
        format: z.literal("glb"),
        url: assetUrlSchema,
        posterUrl: assetUrlSchema.optional(),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        byteLength: z.number().int().positive().max(50_000_000),
      })
      .optional(),
    warnings: z.array(z.string()),
  })
  .superRefine((model, context) => {
    if (
      !model.delivery &&
      (model.vertices.length < 8 || model.faces.length < 6)
    )
      context.addIssue({
        code: "custom",
        message: "A model requires render geometry or a licensed GLB delivery.",
      });
    if (model.delivery && !model.license.commercialUse)
      context.addIssue({
        code: "custom",
        message: "Delivered assets require confirmed commercial-use rights.",
      });
  });

export type VehicleModelRequest = z.infer<typeof vehicleModelRequestSchema>;
export type VehicleModel = z.infer<typeof vehicleModelSchema>;
export type VehicleModelFace = VehicleModel["faces"][number];
export type Vector3 = z.infer<typeof vectorSchema>;
