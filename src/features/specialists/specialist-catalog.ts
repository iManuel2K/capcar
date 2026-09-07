export const specialistTypes = [
  "All specialties",
  "Dyno tuning",
  "Alignment & corner balancing",
  "Custom fabrication",
  "Brand specialist",
] as const;

export type SpecialistType = (typeof specialistTypes)[number];

export type Specialist = {
  id: string;
  name: string;
  city: string;
  distanceKm: number;
  specialties: Exclude<SpecialistType, "All specialties">[];
  description: string;
  partnerState: "candidate" | "beta";
};

export const specialistCatalog: Specialist[] = [
  {
    id: "rhein-main-performance",
    name: "Rhein-Main Performance",
    city: "Frankfurt am Main",
    distanceKm: 18,
    specialties: ["Dyno tuning", "Brand specialist"],
    description: "Illustrative beta listing for power validation and German-brand platforms.",
    partnerState: "candidate",
  },
  {
    id: "apex-chassis-lab",
    name: "Apex Chassis Lab",
    city: "Wiesbaden",
    distanceKm: 24,
    specialties: ["Alignment & corner balancing"],
    description: "Illustrative beta listing for road and track alignment workflows.",
    partnerState: "candidate",
  },
  {
    id: "mainwerk-fabrication",
    name: "Mainwerk Fabrication",
    city: "Rüsselsheim am Main",
    distanceKm: 7,
    specialties: ["Custom fabrication", "Brand specialist"],
    description: "Illustrative beta listing for exhaust, mounting and body fabrication.",
    partnerState: "beta",
  },
];
