import type { Vehicle } from "@/features/vehicles/vehicle-schema";

export type ProblemEvidence = "inspection-data" | "technical-bulletin";
export type ProblemSeverity = "monitor" | "service-soon";

export type KnownProblem = {
  id: string;
  title: string;
  system: string;
  evidence: ProblemEvidence;
  severity: ProblemSeverity;
  applicability: string;
  symptoms: string[];
  nextCheck: string;
  sourceLabel: string;
  sourceUrl: string;
  platforms: string[];
  engineCodes?: string[];
};

export const knownProblems: KnownProblem[] = [
  {
    id: "e9x-springs-dampers",
    title: "Broken springs or worn dampers",
    system: "Suspension",
    evidence: "inspection-data",
    severity: "service-soon",
    applicability: "BMW 3 Series E90/E91/E92/E93 petrol, 2005–2013",
    symptoms: ["Uneven ride height", "Knocking over bumps", "Poor damping or tyre contact"],
    nextCheck: "Have the springs, dampers and tyre wear inspected. Do not infer a failed part from noise alone.",
    sourceLabel: "ADAC used-car report · updated 30 July 2025",
    sourceUrl: "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwageninfos/bmw-3er-reihe-79/",
    platforms: ["E90", "E91", "E92", "E93"],
  },
  {
    id: "e9x-ac-evaporator-sensor",
    title: "Air conditioning becomes warm on long, humid drives",
    system: "Climate",
    evidence: "technical-bulletin",
    severity: "monitor",
    applicability: "BMW 3 Series E90/E91/E92",
    symptoms: ["Warm air after a long drive in high humidity", "Cooling returns after switching A/C off for 10–15 minutes"],
    nextCheck: "Ask a qualified technician to test for evaporator icing and inspect the evaporator-temperature sensor seal.",
    sourceLabel: "HELLA Tech World vehicle-specific repair note",
    sourceUrl: "https://www.hella.com/techworld/be-fr/bi/bmw-serie-3-e90-e91-e92-performance-insuffisante-de-la-climatisation/",
    platforms: ["E90", "E91", "E92"],
  },
  {
    id: "e9x-license-light-frm",
    title: "Rear licence-plate light remains inoperative",
    system: "Electrical",
    evidence: "technical-bulletin",
    severity: "service-soon",
    applicability: "BMW 3 Series E90/E91/E93",
    symptoms: ["Rear licence-plate lamp warning", "Lamp still off after the original electrical fault is repaired"],
    nextCheck: "Read the fault memory and repair the electrical cause before a workshop resets the affected FRM output.",
    sourceLabel: "HELLA Tech World vehicle-specific repair note",
    sourceUrl: "https://www.hella.com/techworld/it/bi/bmw-serie-3-e90-e91-e93-guasto-della-luce-targa/",
    platforms: ["E90", "E91", "E93"],
  },
  {
    id: "e9x-n52-n54-camshaft-valve",
    title: "Engine warning related to camshaft adjustment",
    system: "Engine",
    evidence: "technical-bulletin",
    severity: "service-soon",
    applicability: "E90/E91 with confirmed N52 or N54 engine",
    symptoms: ["Engine warning lamp", "Camshaft-adjustment fault code"],
    nextCheck: "Read the exact fault code. HELLA instructs technicians to check the relevant solenoid valve and replace it only if necessary.",
    sourceLabel: "HELLA Tech World · N52/N54 bulletin",
    sourceUrl: "https://www.hella.com/techworld/en/bi/bmw-3-series-engine-control-light-is-on/index-2.jsp",
    platforms: ["E90", "E91"],
    engineCodes: ["N52", "N54"],
  },
];

export function problemsForVehicle(vehicle: Pick<Vehicle, "platform" | "engineCode">) {
  const platform = vehicle.platform.trim().toUpperCase();
  const engine = vehicle.engineCode.trim().toUpperCase();
  return knownProblems.filter((problem) => {
    if (!problem.platforms.includes(platform)) return false;
    if (!problem.engineCodes) return true;
    return problem.engineCodes.some((code) => engine.startsWith(code));
  });
}

export function hasEngineSpecificCoverage(platform: string) {
  const normalized = platform.trim().toUpperCase();
  return knownProblems.some((problem) => problem.platforms.includes(normalized) && problem.engineCodes);
}
