import type {
  CatalogPart,
  PartFitmentRule,
} from "@/features/parts/part-catalog";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

export type FitmentStatus = "match" | "conditional" | "unverified" | "mismatch";

export type FitmentCheck = {
  label: string;
  expected: string;
  actual: string;
  matched: boolean;
};

export type FitmentResult = {
  status: FitmentStatus;
  label: string;
  checks: FitmentCheck[];
  conditions: string[];
};

export type FitmentVehicle = Pick<
  Vehicle,
  "platform" | "productionYear" | "bodyStyle" | "engineCode"
>;

function checkRule(rule: PartFitmentRule, vehicle: FitmentVehicle) {
  const checks: FitmentCheck[] = [
    {
      label: "Platform",
      expected: rule.platforms.join(", "),
      actual: vehicle.platform,
      matched: rule.platforms.includes(vehicle.platform),
    },
  ];
  if (rule.yearFrom || rule.yearTo) {
    const from = rule.yearFrom ?? 0;
    const to = rule.yearTo ?? 9999;
    checks.push({
      label: "Production year",
      expected: `${from || "Any"}–${to === 9999 ? "Any" : to}`,
      actual: String(vehicle.productionYear),
      matched: vehicle.productionYear >= from && vehicle.productionYear <= to,
    });
  }
  if (rule.bodyStyles)
    checks.push({
      label: "Body style",
      expected: rule.bodyStyles.join(", "),
      actual: vehicle.bodyStyle,
      matched: rule.bodyStyles.includes(vehicle.bodyStyle),
    });
  if (rule.engineCodes)
    checks.push({
      label: "Engine",
      expected: rule.engineCodes.join(", "),
      actual: vehicle.engineCode,
      matched:
        rule.engineCodes.includes(vehicle.engineCode) ||
        rule.engineCodes.some((code) => vehicle.engineCode.startsWith(code)),
    });
  return checks;
}

export function evaluateFitment(
  part: CatalogPart,
  vehicle: FitmentVehicle,
): FitmentResult {
  if (part.fitmentRules.length === 0)
    return {
      status: "unverified",
      label: "Not enough data",
      checks: [],
      conditions: [],
    };
  const evaluated = part.fitmentRules.map((rule) => ({
    rule,
    checks: checkRule(rule, vehicle),
  }));
  const matched = evaluated.find((candidate) =>
    candidate.checks.every((check) => check.matched),
  );
  if (matched) {
    const conditions = matched.rule.conditions ?? [];
    return {
      status: conditions.length > 0 ? "conditional" : "match",
      label:
        conditions.length > 0
          ? "Conditional demo match"
          : "Structured demo match",
      checks: matched.checks,
      conditions,
    };
  }
  const closest = evaluated.toSorted(
    (a, b) =>
      b.checks.filter((check) => check.matched).length -
      a.checks.filter((check) => check.matched).length,
  )[0];
  return {
    status: "mismatch",
    label: "Demo mismatch",
    checks: closest?.checks ?? [],
    conditions: closest?.rule.conditions ?? [],
  };
}
