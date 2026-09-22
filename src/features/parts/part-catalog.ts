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
    brand: "CapCar Demo",
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
    brand: "CapCar Demo",
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
    brand: "CapCar Demo",
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
    brand: "CapCar Demo",
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
    brand: "CapCar Demo",
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
    brand: "CapCar Demo",
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
    brand: "CapCar Demo",
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
    id: "demo-spark-plug-set-n43",
    name: "N43 spark-plug service set",
    brand: "Ignition Lab Demo",
    partNumber: "DEMO-SVC-N43-14",
    category: "Service",
    quality: "Premium",
    summary:
      "Four-plug maintenance set presented with the supporting tools and checks needed before ordering.",
    estimatedPrice: 68,
    difficulty: "Moderate",
    installationMinutes: 75,
    buildStage: "foundation",
    fitmentRules: [
      {
        platforms: ["E90", "E91", "E92"],
        engineCodes: ["N43", "N43B20"],
        conditions: ["Confirm plug specification from the vehicle record"],
      },
    ],
    requiredItems: ["Thin-wall spark-plug socket", "Torque specification"],
    documents: ["Demo service checklist", "Demo tool list"],
  },
  {
    id: "demo-cabin-filter-e9x",
    name: "Activated-carbon cabin filter",
    brand: "Filter Works Demo",
    partNumber: "DEMO-SVC-E9X-18",
    category: "Service",
    quality: "OEM style",
    summary:
      "A quick service item with a complete replacement checklist and filter-orientation reminder.",
    estimatedPrice: 34,
    difficulty: "Easy",
    installationMinutes: 20,
    buildStage: "foundation",
    fitmentRules: [
      { platforms: ["E90", "E91", "E92", "E93"], yearFrom: 2008, yearTo: 2013 },
    ],
    requiredItems: ["Microfibre cloth", "Low-pressure vacuum"],
    documents: ["Demo replacement guide"],
  },
  {
    id: "demo-black-kidney-grilles-e90",
    name: "Shadow-black kidney grille pair",
    brand: "Formline Demo",
    partNumber: "DEMO-EXT-E90-12",
    category: "Exterior",
    quality: "OEM style",
    summary:
      "Gloss-black grille pair for a restrained front-end update, with pre-LCI and LCI checks exposed.",
    estimatedPrice: 92,
    difficulty: "Easy",
    installationMinutes: 35,
    buildStage: "appearance",
    fitmentRules: [
      {
        platforms: ["E90", "E91"],
        bodyStyles: ["Sedan", "Touring"],
        conditions: ["Confirm bonnet shape and pre-LCI or LCI version"],
      },
    ],
    requiredItems: ["Plastic trim tools"],
    documents: ["Demo fitment drawing", "Demo installation guide"],
  },
  {
    id: "demo-front-lip-e90",
    name: "Low-profile front lip",
    brand: "Formline Demo",
    partNumber: "DEMO-EXT-E90-16",
    category: "Exterior",
    quality: "Performance",
    summary:
      "A subtle front-lip concept with bumper compatibility, ground-clearance and mounting checks.",
    estimatedPrice: 189,
    difficulty: "Moderate",
    installationMinutes: 90,
    buildStage: "appearance",
    fitmentRules: [
      {
        platforms: ["E90"],
        bodyStyles: ["Sedan"],
        conditions: ["Confirm bumper type", "Road approval is not verified"],
      },
    ],
    requiredItems: ["Vehicle-safe fasteners", "Panel preparation materials"],
    documents: ["Demo dimension sheet", "Approval not verified"],
  },
  {
    id: "demo-boot-spoiler-e90",
    name: "OEM+ boot-lid spoiler",
    brand: "Formline Demo",
    partNumber: "DEMO-EXT-E90-19",
    category: "Exterior",
    quality: "Premium",
    summary:
      "Paint-ready lip spoiler with surface preparation and adhesive planning included.",
    estimatedPrice: 159,
    difficulty: "Moderate",
    installationMinutes: 80,
    buildStage: "appearance",
    fitmentRules: [
      {
        platforms: ["E90"],
        bodyStyles: ["Sedan"],
        conditions: ["Dry-fit against the boot-lid profile before painting"],
      },
    ],
    requiredItems: ["Automotive adhesive tape", "Degreaser", "Masking tape"],
    documents: ["Demo placement guide", "Demo paint preparation notes"],
  },
  {
    id: "demo-catback-exhaust-e90-n43",
    name: "Road-spec cat-back exhaust",
    brand: "Toneworks Demo",
    partNumber: "DEMO-PER-E90-31",
    category: "Performance",
    quality: "Performance",
    summary:
      "Rear exhaust concept with hanger, outlet, sound and documentation checks collected in one place.",
    estimatedPrice: 749,
    difficulty: "Advanced",
    installationMinutes: 210,
    buildStage: "performance",
    fitmentRules: [
      {
        platforms: ["E90"],
        engineCodes: ["N43", "N43B20"],
        conditions: [
          "Confirm pipe diameter and rear-bumper opening",
          "ABE or registration status is not verified",
        ],
      },
    ],
    requiredItems: ["New clamps", "Exhaust hangers", "Leak-test materials"],
    documents: [
      "Demo layout drawing",
      "Sound sample pending",
      "ABE not verified",
    ],
  },
  {
    id: "demo-led-side-repeaters-e9x",
    name: "Smoked LED side repeaters",
    brand: "Nightline Demo",
    partNumber: "DEMO-LGT-E9X-23",
    category: "Lighting",
    quality: "Value",
    summary:
      "Plug-in side-marker concept with polarity, sealing and approval checks made visible.",
    estimatedPrice: 48,
    difficulty: "Easy",
    installationMinutes: 25,
    buildStage: "appearance",
    fitmentRules: [
      {
        platforms: ["E90", "E91", "E92", "E93"],
        conditions: ["Confirm connector and E-mark before road use"],
      },
    ],
    requiredItems: ["Plastic trim tool", "Seal inspection"],
    documents: ["Demo wiring note", "E-mark not verified"],
  },
  {
    id: "demo-rear-brake-kit-e9x",
    name: "Rear brake refresh kit",
    brand: "Brakeworks Demo",
    partNumber: "DEMO-BRK-E9X-27",
    category: "Brakes",
    quality: "Premium",
    summary:
      "Rear discs, pads and wear-sensor planning bundle with the essential safety dependencies surfaced.",
    estimatedPrice: 298,
    difficulty: "Advanced",
    installationMinutes: 190,
    buildStage: "foundation",
    fitmentRules: [
      {
        platforms: ["E90", "E91", "E92", "E93"],
        conditions: [
          "Measure disc diameter",
          "Confirm parking-brake dimensions",
        ],
      },
    ],
    requiredItems: [
      "Correct fasteners",
      "Brake cleaner",
      "Torque specification",
    ],
    documents: ["Demo component list", "Safety procedure required"],
  },
  {
    id: "demo-g20-splitter",
    name: "G20 front splitter concept",
    brand: "CapCar Demo",
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

export function searchCatalogParts(query: string) {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
  if (!terms.length) return partCatalog.slice(0, 8);
  return partCatalog
    .map((part) => {
      const primary =
        `${part.name} ${part.brand} ${part.partNumber}`.toLowerCase();
      const fitment = part.fitmentRules
        .flatMap((rule) => [
          ...rule.platforms,
          ...(rule.engineCodes ?? []),
          ...(rule.bodyStyles ?? []),
        ])
        .join(" ")
        .toLowerCase();
      const secondary =
        `${part.category} ${part.summary} ${fitment}`.toLowerCase();
      const score = terms.reduce(
        (total, term) =>
          total +
          (primary.includes(term) ? 3 : 0) +
          (secondary.includes(term) ? 1 : 0),
        0,
      );
      return { part, score };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((result) => result.part);
}
