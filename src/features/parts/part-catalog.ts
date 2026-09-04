import type { BuildStage } from "@/features/builds/build-schema";

export const partCategories = [
  "Service",
  "Brakes",
  "Suspension",
  "Wheels",
  "Exterior",
  "Lighting",
  "Performance",
] as const;

export type PartCategory = (typeof partCategories)[number];
export type PartDifficulty = "Easy" | "Moderate" | "Advanced";

export type PartFitmentRule = {
  platforms: string[];
  yearFrom?: number;
  yearTo?: number;
  bodyStyles?: string[];
  engineCodes?: string[];
  conditions?: string[];
};

export type CatalogPart = {
  id: string;
  name: string;
  brand: string;
  partNumber: string;
  category: PartCategory;
  quality: "Value" | "OEM style" | "Performance" | "Premium";
  summary: string;
  estimatedPrice: number;
  difficulty: PartDifficulty;
  installationMinutes: number;
  buildStage: BuildStage;
  fitmentRules: PartFitmentRule[];
  requiredItems: string[];
  documents: string[];
};

export const partCatalog: CatalogPart[] = [
  {
    id: "demo-n43-service-kit",
    name: "N43 oil-service kit",
    brand: "Capcar Demo",
    partNumber: "DEMO-SVC-N43-01",
    category: "Service",
    quality: "OEM style",
    summary:
      "Concept bundle with filter, seal and planning quantity for an oil service.",
    estimatedPrice: 82,
    difficulty: "Moderate",
    installationMinutes: 70,
    buildStage: "foundation",
    fitmentRules: [
      {
        platforms: ["E90", "E91", "E92"],
        yearFrom: 2008,
        yearTo: 2012,
        engineCodes: ["N43", "N43B20"],
      },
    ],
    requiredItems: [
      "Correct approved engine oil",
      "Drain-plug sealing ring",
      "Oil-filter cap tool",
    ],
    documents: ["Demo specification sheet"],
  },
  {
    id: "demo-dark-rear-lamps-e90",
    name: "Dark-red rear lamp set",
    brand: "Capcar Demo",
    partNumber: "DEMO-LGT-E90-02",
    category: "Lighting",
    quality: "Premium",
    summary: "Dark inner treatment for a cleaner rear appearance concept.",
    estimatedPrice: 329,
    difficulty: "Moderate",
    installationMinutes: 95,
    buildStage: "appearance",
    fitmentRules: [
      {
        platforms: ["E90"],
        yearFrom: 2009,
        yearTo: 2011,
        bodyStyles: ["Sedan"],
        conditions: [
          "Confirm pre-LCI or LCI connector",
          "Road approval is not verified",
        ],
      },
    ],
    requiredItems: [
      "Vehicle-specific wiring adapter if required",
      "Replacement sealing foam",
    ],
    documents: ["Demo dimensional drawing", "Approval document not verified"],
  },
  {
    id: "demo-rear-diffuser-e90",
    name: "Gloss-black rear diffuser",
    brand: "Capcar Demo",
    partNumber: "DEMO-EXT-E90-08",
    category: "Exterior",
    quality: "OEM style",
    summary:
      "A subtle diffuser concept intended for an M-Sport-style rear bumper.",
    estimatedPrice: 419,
    difficulty: "Moderate",
    installationMinutes: 120,
    buildStage: "appearance",
    fitmentRules: [
      {
        platforms: ["E90"],
        bodyStyles: ["Sedan"],
        conditions: [
          "Requires compatible M-Sport-style bumper",
          "Confirm exhaust outlet layout",
        ],
      },
    ],
    requiredItems: [
      "Compatible rear bumper",
      "Mounting clips",
      "Correct exhaust opening",
    ],
    documents: ["Demo installation outline"],
  },
  {
    id: "demo-front-brake-kit-e9x",
    name: "Front brake refresh kit",
    brand: "Capcar Demo",
    partNumber: "DEMO-BRK-E9X-11",
    category: "Brakes",
    quality: "Premium",
    summary:
      "Concept front discs, pads and wear sensor for an E9x brake refresh.",
    estimatedPrice: 365,
    difficulty: "Advanced",
    installationMinutes: 180,
    buildStage: "foundation",
    fitmentRules: [
      {
        platforms: ["E90", "E91", "E92", "E93"],
        yearFrom: 2008,
        yearTo: 2013,
        conditions: [
          "Brake diameter must be measured",
          "Option codes must be confirmed",
        ],
      },
    ],
    requiredItems: [
      "Correct caliper-carrier bolts",
      "Brake cleaner",
      "Torque specification",
    ],
    documents: ["Demo component list", "Safety procedure required"],
  },
  {
    id: "demo-18-wheel-set-e9x",
    name: "18-inch graphite wheel set",
    brand: "Capcar Demo",
    partNumber: "DEMO-WHL-E9X-18",
    category: "Wheels",
    quality: "Performance",
    summary: "Graphite multi-spoke wheel concept for an OEM+ road build.",
    estimatedPrice: 980,
    difficulty: "Moderate",
    installationMinutes: 90,
    buildStage: "handling",
    fitmentRules: [
      {
        platforms: ["E90", "E91", "E92", "E93"],
        conditions: [
          "Confirm width and offset",
          "Check tyre size and brake clearance",
          "Approval is not verified",
        ],
      },
    ],
    requiredItems: [
      "Compatible tyres",
      "Wheel bolts",
      "Hub rings if applicable",
    ],
    documents: ["Demo wheel dimensions", "ABE not verified"],
  },
  {
    id: "demo-street-coilovers-e9x",
    name: "Street coilover concept",
    brand: "Capcar Demo",
    partNumber: "DEMO-SUS-E9X-21",
    category: "Suspension",
    quality: "Performance",
    summary:
      "Height-adjustable road suspension concept with comfort-oriented settings.",
    estimatedPrice: 1190,
    difficulty: "Advanced",
    installationMinutes: 360,
    buildStage: "handling",
    fitmentRules: [
      {
        platforms: ["E90", "E91"],
        conditions: [
          "Confirm axle loads",
          "Alignment required",
          "Registration may be required",
        ],
      },
    ],
    requiredItems: [
      "New top-mount hardware",
      "Wheel alignment",
      "Vehicle-specific approval",
    ],
    documents: ["Demo adjustment range", "Teilegutachten not verified"],
  },
  {
    id: "demo-intake-n43",
    name: "Panel-filter intake upgrade",
    brand: "Capcar Demo",
    partNumber: "DEMO-PER-N43-05",
    category: "Performance",
    quality: "Performance",
    summary: "Conservative intake concept retaining the factory airbox.",
    estimatedPrice: 74,
    difficulty: "Easy",
    installationMinutes: 25,
    buildStage: "performance",
    fitmentRules: [
      {
        platforms: ["E90", "E91", "E92"],
        engineCodes: ["N43", "N43B20"],
        conditions: ["Performance gain is not claimed"],
      },
    ],
    requiredItems: [],
    documents: ["Demo product sheet"],
  },
  {
    id: "demo-g20-splitter",
    name: "G20 front splitter concept",
    brand: "Capcar Demo",
    partNumber: "DEMO-EXT-G20-01",
    category: "Exterior",
    quality: "Value",
    summary: "A catalogue mismatch used to demonstrate vehicle exclusion.",
    estimatedPrice: 210,
    difficulty: "Moderate",
    installationMinutes: 80,
    buildStage: "appearance",
    fitmentRules: [
      { platforms: ["G20"], yearFrom: 2019, bodyStyles: ["Sedan"] },
    ],
    requiredItems: ["Compatible G20 bumper"],
    documents: ["Demo drawing"],
  },
];

export function findCatalogPart(partId: string) {
  return partCatalog.find((part) => part.id === partId);
}
