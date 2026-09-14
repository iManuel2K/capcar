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
export const visualExhausts = ["stock", "dual", "quad"] as const;
export const tipFinishes = ["chrome", "black", "titanium"] as const;
export const rearAeroOptions = ["none", "lip", "ducktail", "wing"] as const;
export const caliperColors = ["silver", "red", "blue", "yellow"] as const;
export const discOptions = ["standard", "large", "slotted"] as const;
export const trimOptions = ["stock", "sport"] as const;
export const interiorOptions = {
  seatStyle: ["standard", "sport"],
  upholstery: ["black", "tan", "red"],
  cabinTrim: ["aluminum", "wood", "piano-black"],
  steeringWheel: ["round", "flat-bottom"],
  cabinScreen: ["factory", "wide"],
  ambientLight: ["off", "blue", "purple"],
  pedals: ["standard", "metal"],
  floorMats: ["dark", "light"],
  gearKnob: ["stock", "sport"],
  drivingSide: ["left", "right"],
} as const;

export const referenceConfigurationSchema = z.object({
  paints: z.record(z.string(), z.string().regex(/^#[0-9a-f]{6}$/i)),
  camera: z
    .object({
      position: z.array(z.number().finite()).length(3),
      target: z.array(z.number().finite()).length(3),
    })
    .optional(),
});
export type ReferenceConfiguration = z.infer<
  typeof referenceConfigurationSchema
>;

export const buildVisualSchema = z.object({
  vehicleId: z.string().min(1),
  buildId: z.string().min(1),
  reference: referenceConfigurationSchema
    .extend({ modelUid: z.string().regex(/^[a-f0-9]{32}$/) })
    .optional(),
  paint: z.enum(visualPaints),
  wheels: z.enum(visualWheels),
  stance: z.enum(visualStances),
  lighting: z.enum(visualLighting),
  aero: z.enum(visualAero),
  exhaust: z.enum(visualExhausts).default("stock"),
  tipFinish: z.enum(tipFinishes).default("chrome"),
  rearAero: z.enum(rearAeroOptions).default("none"),
  calipers: z.enum(caliperColors).default("silver"),
  discs: z.enum(discOptions).default("standard"),
  skirts: z.enum(trimOptions).default("stock"),
  diffuser: z.enum(trimOptions).default("stock"),
  mirrors: z.enum(["body", "black"]).default("body"),
  seatStyle: z.enum(interiorOptions.seatStyle).default("standard"),
  upholstery: z.enum(interiorOptions.upholstery).default("black"),
  cabinTrim: z.enum(interiorOptions.cabinTrim).default("aluminum"),
  steeringWheel: z.enum(interiorOptions.steeringWheel).default("round"),
  cabinScreen: z.enum(interiorOptions.cabinScreen).default("factory"),
  ambientLight: z.enum(interiorOptions.ambientLight).default("off"),
  pedals: z.enum(interiorOptions.pedals).default("standard"),
  floorMats: z.enum(interiorOptions.floorMats).default("dark"),
  gearKnob: z.enum(interiorOptions.gearKnob).default("stock"),
  drivingSide: z.enum(interiorOptions.drivingSide).default("left"),
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
  return buildVisualSchema.parse({
    vehicleId,
    buildId,
    paint: "factory-black",
    wheels: "factory",
    stance: "stock",
    lighting: "factory",
    aero: "factory",
    updatedAt: new Date(0).toISOString(),
  });
}
