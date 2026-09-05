import { z } from "zod";

import type { Vehicle } from "@/features/vehicles/vehicle-schema";

export const tuningGoals = [
  "oem_plus",
  "appearance",
  "handling",
  "sound",
  "power",
] as const;
export const tuningExperience = ["beginner", "intermediate"] as const;

export const tuningPlanInputSchema = z.object({
  goal: z.enum(tuningGoals),
  experience: z.enum(tuningExperience),
  budget: z.number().int().min(500).max(100_000),
});

export type TuningPlanInput = z.infer<typeof tuningPlanInputSchema>;
export type TuningStage = {
  id: string;
  order: number;
  title: string;
  reason: string;
  budget: number;
  checks: string[];
};
export type TuningPlan = TuningPlanInput & {
  vehicleId: string;
  generatedAt: string;
  stages: TuningStage[];
  warnings: string[];
};

type StageTemplate = Omit<TuningStage, "budget"> & { share: number };

const foundations: StageTemplate[] = [
  {
    id: "baseline",
    order: 1,
    title: "Establish the maintenance baseline",
    reason:
      "Known faults and overdue service make every later modification harder to judge.",
    share: 0.2,
    checks: [
      "Resolve warning lights and fluid leaks",
      "Record oil, filters, plugs and fluid history",
      "Inspect tyres, brakes, suspension and battery",
    ],
  },
  {
    id: "safety",
    order: 2,
    title: "Secure tyres, brakes and handling",
    reason:
      "The car must stop, steer and maintain grip before appearance, sound or power changes.",
    share: 0.25,
    checks: [
      "Confirm tyre age, size, load and speed ratings",
      "Inspect pads, discs and brake fluid",
      "Check alignment and worn suspension joints",
    ],
  },
];

const goalStages: Record<TuningPlanInput["goal"], StageTemplate[]> = {
  oem_plus: [
    {
      id: "oem-detail",
      order: 3,
      title: "Refine the factory design",
      reason:
        "A restrained build works best when every change follows one material and colour direction.",
      share: 0.35,
      checks: [
        "Choose one wheel and trim direction",
        "Prefer reversible modifications",
        "Keep removed original parts",
      ],
    },
    {
      id: "oem-verify",
      order: 4,
      title: "Verify and document",
      reason:
        "Receipts, settings and approval documents make the build maintainable and transferable.",
      share: 0.2,
      checks: [
        "Confirm road-use documents",
        "Record alignment and coding",
        "Photograph the completed stage",
      ],
    },
  ],
  appearance: [
    {
      id: "visual-system",
      order: 3,
      title: "Lock the visual system",
      reason:
        "Wheels, stance, lighting and aero should be planned as one composition before ordering.",
      share: 0.4,
      checks: [
        "Save a Capcar concept",
        "Verify wheel and suspension interaction",
        "Check lighting and aero approval",
      ],
    },
    {
      id: "finish",
      order: 4,
      title: "Install, align and finish",
      reason:
        "Panel gaps, ride height and alignment determine whether the result looks intentional.",
      share: 0.15,
      checks: [
        "Install in dependency order",
        "Complete alignment",
        "Inspect clearance through full travel",
      ],
    },
  ],
  handling: [
    {
      id: "handling-system",
      order: 3,
      title: "Match suspension, wheels and tyres",
      reason:
        "Handling comes from a balanced system, not the stiffest individual component.",
      share: 0.4,
      checks: [
        "Confirm axle loads and intended use",
        "Check wheel and brake clearance",
        "Plan alignment targets",
      ],
    },
    {
      id: "handling-test",
      order: 4,
      title: "Set up and validate progressively",
      reason:
        "One change at a time makes noise, comfort and handling effects easier to understand.",
      share: 0.15,
      checks: [
        "Record baseline behavior",
        "Recheck fasteners using verified specifications",
        "Inspect tyre wear",
      ],
    },
  ],
  sound: [
    {
      id: "sound-design",
      order: 3,
      title: "Choose a legal sound direction",
      reason:
        "Cabin drone, emissions equipment and road-use documentation matter more than a short sound clip.",
      share: 0.35,
      checks: [
        "Listen under load and cruising",
        "Retain required emissions equipment",
        "Verify approval for the exact vehicle",
      ],
    },
    {
      id: "sound-check",
      order: 4,
      title: "Install and inspect for leaks",
      reason:
        "Correct mounting and clearance protect the vehicle and prevent unwanted noise.",
      share: 0.2,
      checks: [
        "Check hangers and heat shields",
        "Inspect cold and hot clearance",
        "Recheck for leaks",
      ],
    },
  ],
  power: [
    {
      id: "supporting-systems",
      order: 3,
      title: "Prepare supporting systems",
      reason:
        "Cooling, ignition, fuelling and drivetrain condition set the safe boundary for later tuning.",
      share: 0.3,
      checks: [
        "Log baseline health",
        "Resolve cooling and ignition weaknesses",
        "Confirm fuel and drivetrain condition",
      ],
    },
    {
      id: "calibration",
      order: 4,
      title: "Use a qualified vehicle-specific calibration",
      reason:
        "Generic performance claims cannot account for fuel, hardware, condition and local rules.",
      share: 0.25,
      checks: [
        "Choose a qualified specialist",
        "Record before-and-after logs",
        "Verify emissions and insurance implications",
      ],
    },
  ],
};

export function generateTuningPlan(
  vehicle: Pick<Vehicle, "id" | "model" | "platform" | "engineCode">,
  input: TuningPlanInput,
  now = new Date().toISOString(),
): TuningPlan {
  const normalized = tuningPlanInputSchema.parse(input);
  const templates = [...foundations, ...goalStages[normalized.goal]];
  const stages = templates.map(({ share, ...stage }) => ({
    ...stage,
    budget: Math.round(normalized.budget * share),
  }));
  return {
    ...normalized,
    vehicleId: vehicle.id,
    generatedAt: now,
    stages,
    warnings: [
      `This roadmap is generic guidance for the ${vehicle.platform} ${vehicle.model}; it is not a tune specification.`,
      `No power gain, torque value, fitment or legal approval is claimed for engine ${vehicle.engineCode}.`,
      "Use the compatibility report and authoritative documents before purchasing or installing parts.",
    ],
  };
}
