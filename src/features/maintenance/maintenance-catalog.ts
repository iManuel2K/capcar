export const maintenanceCategories = [
  "Engine",
  "Fluids",
  "Filters",
  "Brakes",
  "Tyres",
  "Electrical",
  "Inspection",
] as const;

export const maintenanceCriticalities = [
  "routine",
  "attention",
  "safety",
] as const;

export type MaintenanceTemplate = {
  key: string;
  title: string;
  description: string;
  category: (typeof maintenanceCategories)[number];
  criticality: (typeof maintenanceCriticalities)[number];
  intervalKm?: number;
  intervalMonths?: number;
};

export const maintenanceCatalog: MaintenanceTemplate[] = [
  {
    key: "engine-oil-filter",
    title: "Engine oil & oil filter",
    description: "Record the oil specification, filter and completed mileage.",
    category: "Engine",
    criticality: "attention",
    intervalKm: 15_000,
    intervalMonths: 12,
  },
  {
    key: "brake-fluid",
    title: "Brake fluid",
    description: "Time-based fluid service that affects braking performance.",
    category: "Fluids",
    criticality: "safety",
    intervalMonths: 24,
  },
  {
    key: "coolant",
    title: "Engine coolant",
    description: "Check level, condition, leaks and replacement history.",
    category: "Fluids",
    criticality: "attention",
    intervalMonths: 48,
  },
  {
    key: "air-filter",
    title: "Engine air filter",
    description: "Inspect or replace the intake filter element.",
    category: "Filters",
    criticality: "routine",
    intervalKm: 30_000,
    intervalMonths: 24,
  },
  {
    key: "cabin-filter",
    title: "Cabin microfilter",
    description: "Replace the interior air and pollen filter.",
    category: "Filters",
    criticality: "routine",
    intervalKm: 20_000,
    intervalMonths: 12,
  },
  {
    key: "spark-plugs",
    title: "Spark plugs",
    description: "Record the plug type and inspect ignition condition.",
    category: "Engine",
    criticality: "attention",
    intervalKm: 60_000,
    intervalMonths: 48,
  },
  {
    key: "front-brakes",
    title: "Front brakes",
    description: "Inspect pad thickness, disc condition and braking behavior.",
    category: "Brakes",
    criticality: "safety",
    intervalKm: 15_000,
    intervalMonths: 12,
  },
  {
    key: "rear-brakes",
    title: "Rear brakes",
    description: "Inspect pads, discs and parking-brake operation.",
    category: "Brakes",
    criticality: "safety",
    intervalKm: 15_000,
    intervalMonths: 12,
  },
  {
    key: "tyres",
    title: "Tyres",
    description: "Check pressure, tread depth, age, damage and uneven wear.",
    category: "Tyres",
    criticality: "safety",
    intervalKm: 10_000,
    intervalMonths: 6,
  },
  {
    key: "battery",
    title: "12 V battery",
    description: "Check age, voltage, terminals and cold-start behavior.",
    category: "Electrical",
    criticality: "routine",
    intervalMonths: 12,
  },
  {
    key: "tuev",
    title: "TÜV / HU inspection",
    description: "Track the next German roadworthiness inspection date.",
    category: "Inspection",
    criticality: "attention",
    intervalMonths: 24,
  },
];
