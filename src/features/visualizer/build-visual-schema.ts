import { z } from "zod";

export const visualPaints = [
  "factory-black",
  "alpine-white",
  "estoril-blue",
  "deep-green",
] as const;
export const visualWheels = ["factory", "graphite", "silver-mesh"] as const;
export const visualStances = ["stock", "sport", "low"] as const;
export const visualLighting = ["factory", "dark"] as const;
export const visualAero = ["factory", "sport"] as const;

export const buildVisualSchema = z.object({
  vehicleId: z.string().min(1),
  buildId: z.string().min(1),
  paint: z.enum(visualPaints),
  wheels: z.enum(visualWheels),
  stance: z.enum(visualStances),
  lighting: z.enum(visualLighting),
  aero: z.enum(visualAero),
  updatedAt: z.string().datetime(),
});

export type BuildVisual = z.infer<typeof buildVisualSchema>;
export type VisualPaint = (typeof visualPaints)[number];
export type VisualWheels = (typeof visualWheels)[number];
export type VisualStance = (typeof visualStances)[number];
export type VisualLighting = (typeof visualLighting)[number];
export type VisualAero = (typeof visualAero)[number];

export function createDefaultBuildVisual(
  vehicleId: string,
  buildId: string,
): BuildVisual {
  return {
    vehicleId,
    buildId,
    paint: "factory-black",
    wheels: "factory",
    stance: "stock",
    lighting: "factory",
    aero: "factory",
    updatedAt: new Date(0).toISOString(),
  };
}
