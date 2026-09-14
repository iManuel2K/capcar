import type { KnownProblem } from "./problem-catalog";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

export type DailyCarProblem = KnownProblem & {
  make: string;
  models: string[];
  years: [number, number];
  reviewedAt: string;
  requiresVariantConfirmation?: boolean;
  inspectionSteps: string[];
};

// Small, source-reviewed release batch. This is not a sales ranking or complete
// 2006–2026 database. Restricted variants require owner confirmation in the UI.
export const dailyCarProblems: DailyCarProblem[] = [
  {
    id: "golf-vii-coolant",
    title: "Coolant loss: inspect the system before ordering a pump",
    system: "Cooling",
    evidence: "technical-bulletin",
    severity: "service-soon",
    make: "Volkswagen",
    models: ["Golf", "Golf VII", "Golf 7"],
    platforms: ["5G", "AU", "GOLF VII", "GOLF 7", "MK7"],
    years: [2012, 2020],
    requiresVariantConfirmation: true,
    applicability:
      "Golf VII, 1.0 / 1.2 / 1.4 / 1.6 petrol only, from 2012. Confirm engine variant; not a GTI/R or diesel diagnosis.",
    symptoms: ["Coolant level repeatedly falls"],
    nextCheck:
      "Arrange a manufacturer-specified pressure test. Inspect the pump and seals along with the rest of the circuit; a falling level does not prove the pump failed.",
    sourceLabel: "HELLA Tech World · Golf VII coolant-loss bulletin",
    sourceUrl:
      "https://www.hella.com/techworld/en/bi/vw-golf-7-loss-of-coolant/",
    reviewedAt: "2026-09-14",
    inspectionSteps: [
      "Let the engine cool fully. Do not open a hot pressurised cooling system.",
      "Record the cold level, date, mileage and warning message. Photograph visible traces from a safe position; do not crawl beneath an unsupported car.",
      "If overheating or a stop warning appears, stop safely and arrange assistance. Do not keep driving to test the symptom.",
      "Ask a workshop to pressure-test the complete circuit and establish the leak location before choosing parts.",
      "Keep the test result and exact replacement part number with the build. Refill and bleeding require the engine-specific procedure and coolant specification.",
    ],
  },
  {
    id: "fiesta-2008-steering-oil",
    title: "Steering condition and oil leaks deserve a closer check",
    system: "Inspection",
    evidence: "inspection-data",
    severity: "service-soon",
    make: "Ford",
    models: ["Fiesta"],
    platforms: ["JA8", "JR8", "FIESTA"],
    years: [2008, 2017],
    requiresVariantConfirmation: true,
    applicability:
      "Fiesta 2008–2017 petrol/LPG report. Model-level inspection trend, not an engine-specific fault bulletin.",
    symptoms: [
      "New steering noise, play or an abnormal feel",
      "Visible oil traces or repeated oil-level loss",
    ],
    nextCheck:
      "ADAC identifies steering and oil loss as inspection weak points. Have the actual steering concern and leak source assessed; do not select a replacement from the symptom alone.",
    sourceLabel: "ADAC · Fiesta 2008–2017 petrol used-car report",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/ford-fiesta-168/",
    reviewedAt: "2026-09-14",
    inspectionSteps: [
      "Record the symptom, when it occurs and the odometer reading. Note whether steering effort or directional control changed.",
      "Do not road-test a vehicle with impaired steering. Arrange professional inspection or recovery.",
      "From a safe position, photograph oil traces and record the fluid level using the owner's handbook procedure. Do not identify fluid solely by its colour.",
      "Ask the workshop to identify the affected steering component or exact leak location. Keep its findings separate from the model-level report.",
      "Compare parts only after diagnosis. Store the invoice and post-repair check with the vehicle record.",
    ],
  },
  {
    id: "auris-2013-battery",
    title: "Battery-related breakdowns: test before replacing",
    system: "Electrical",
    evidence: "inspection-data",
    severity: "monitor",
    make: "Toyota",
    models: ["Auris", "Auris Touring Sports"],
    platforms: ["E180", "E18", "AURIS"],
    years: [2013, 2019],
    applicability:
      "Toyota Auris generation 2013–2019. Battery-related breakdown trend; this is not evidence that a hybrid traction battery has failed.",
    symptoms: [
      "Vehicle will not start or enter its ready state",
      "Repeated low-voltage battery trouble",
    ],
    nextCheck:
      "ADAC reports battery-related breakdowns. Request a battery and charging-system assessment matched to the powertrain; do not infer a failed traction battery.",
    sourceLabel: "ADAC · Auris 2013–2019 used-car report",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/toyota-auris-232/",
    reviewedAt: "2026-09-14",
    inspectionSteps: [
      "Record whether the car fails to crank or fails to enter READY, plus warning messages and recent periods of non-use.",
      "Do not touch orange high-voltage cables or open a hybrid battery enclosure. This checklist contains no high-voltage repair steps.",
      "Check the handbook for the correct assistance procedure. Do not improvise jump-start connections.",
      "Ask for a measured battery-condition and charging-system report. A no-start symptom alone is insufficient evidence for replacement.",
      "Save the test report, battery specification and any invoice. Record recurrence separately so a repeated problem can be investigated.",
    ],
  },
  {
    id: "mazda3-2013-battery",
    title: "Recurring battery trouble needs a measured diagnosis",
    system: "Electrical",
    evidence: "inspection-data",
    severity: "monitor",
    make: "Mazda",
    models: ["3", "Mazda3", "Mazda 3"],
    platforms: ["BM", "BN"],
    years: [2013, 2019],
    applicability:
      "Mazda 3 generation 2013–2019, petrol and diesel. Model-level breakdown pattern, not proof of a defective battery in your car.",
    symptoms: [
      "Repeated starting difficulty",
      "Battery needs repeated assistance",
    ],
    nextCheck:
      "ADAC highlights battery problems in this generation. Have battery health and charging behaviour checked before buying a replacement.",
    sourceLabel: "ADAC · Mazda 3 2013–2019 used-car report",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/mazda-3-238/",
    reviewedAt: "2026-09-14",
    inspectionSteps: [
      "Record when starting difficulty occurs, warning messages, accessory use and how long the vehicle stood unused.",
      "Use the handbook's battery-assistance instructions. Stop if the battery is swollen, leaking or visibly damaged.",
      "Request a battery-condition and charging-system test; do not assume that replacement will resolve an unexplained discharge.",
      "Confirm the required battery technology and any initialization procedure for the exact vehicle before comparing offers.",
      "Keep the measured test results and fitted part reference in the Passport document library. Record a follow-up observation after the repair.",
    ],
  },
];

// Editorial intake list only: no dates, failure claims or sales positions are
// inferred from these model names. Coverage is published one evidenced batch at a time.
export const coverageResearchQueue = [
  "VW Golf / Polo / Passat / Tiguan",
  "Škoda Octavia / Fabia / Superb",
  "SEAT Leon / Ibiza",
  "Audi A3 / A4",
  "BMW 1 Series / 3 Series / 5 Series",
  "Mercedes A-Class / C-Class / E-Class",
  "Ford Focus / Fiesta",
  "Opel Astra / Corsa",
  "Toyota Yaris / Auris / Corolla",
  "Honda Civic / Jazz",
  "Hyundai i20 / i30",
  "Kia Ceed / Rio",
  "Renault Clio / Mégane",
  "Peugeot 208 / 308",
  "Dacia Sandero / Duster",
  "Nissan Qashqai",
  "Mazda 3 / MX-5",
  "VW Golf GTI / R",
  "BMW E46 / E90 enthusiast variants",
  "Toyota GT86 / GR86",
  "Subaru BRZ / Impreza",
  "Nissan 350Z / 370Z",
] as const;

const normalize = (value: string | undefined) =>
  value?.trim().toUpperCase().replace(/^VW$/, "VOLKSWAGEN") ?? "";

export function dailyProblemsForVehicle(
  vehicle: Pick<Vehicle, "platform" | "engineCode"> &
    Partial<Pick<Vehicle, "make" | "model" | "productionYear">>,
) {
  return dailyCarProblems.filter((problem) => {
    if (normalize(vehicle.make) !== normalize(problem.make)) return false;
    if (
      !problem.models.some(
        (model) => normalize(model) === normalize(vehicle.model),
      )
    )
      return false;
    if (
      !vehicle.productionYear ||
      vehicle.productionYear < problem.years[0] ||
      vehicle.productionYear > problem.years[1]
    )
      return false;
    return problem.platforms.some(
      (platform) => normalize(platform) === normalize(vehicle.platform),
    );
  });
}
