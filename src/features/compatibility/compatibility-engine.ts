import type { BuildItem } from "@/features/builds/build-schema";
import { evaluateFitment, type FitmentVehicle } from "@/features/parts/fitment";
import { findCatalogPart } from "@/features/parts/part-catalog";

export type CompatibilitySeverity = "block" | "review" | "info";
export type CompatibilityFinding = {
  id: string;
  severity: CompatibilitySeverity;
  category: "fitment" | "interaction" | "dependency" | "legal" | "data";
  title: string;
  detail: string;
  itemIds: string[];
};

export type CompatibilityReport = {
  status: "blocked" | "review_required" | "ready_for_next_step";
  findings: CompatibilityFinding[];
  structuredItems: number;
  unstructuredItems: number;
};

export function evaluateBuildCompatibility(input: {
  vehicle: FitmentVehicle;
  items: BuildItem[];
}): CompatibilityReport {
  const findings: CompatibilityFinding[] = [];
  const structured = input.items
    .map((item) => ({
      item,
      part: item.catalogPartId
        ? findCatalogPart(item.catalogPartId)
        : undefined,
    }))
    .filter((entry) => entry.part !== undefined);
  const unstructured = input.items.filter(
    (item) => !item.catalogPartId || !findCatalogPart(item.catalogPartId),
  );

  if (input.items.length === 0) {
    findings.push({
      id: "empty-build",
      severity: "info",
      category: "data",
      title: "No parts to evaluate yet",
      detail:
        "Add catalogue parts to create a build-level compatibility report.",
      itemIds: [],
    });
  }

  for (const item of unstructured) {
    findings.push({
      id: `unstructured-${item.id}`,
      severity: "review",
      category: "data",
      title: `Manual item needs structured data · ${item.title}`,
      detail:
        "CapCar cannot evaluate fitment or interactions until this roadmap item is connected to a catalogue part.",
      itemIds: [item.id],
    });
  }

  for (const { item, part } of structured) {
    if (!part) continue;
    const fitment = evaluateFitment(part, input.vehicle);
    if (fitment.status === "mismatch") {
      findings.push({
        id: `fitment-block-${item.id}`,
        severity: "block",
        category: "fitment",
        title: `Vehicle mismatch · ${part.name}`,
        detail:
          "At least one structured vehicle rule does not match. Do not treat this part as compatible.",
        itemIds: [item.id],
      });
    } else if (
      fitment.status === "conditional" ||
      fitment.status === "unverified"
    ) {
      findings.push({
        id: `fitment-review-${item.id}`,
        severity: "review",
        category: "fitment",
        title: `Fitment evidence incomplete · ${part.name}`,
        detail:
          fitment.conditions.join(" · ") ||
          "Additional vehicle and part attributes are required.",
        itemIds: [item.id],
      });
    }

    const legalConcern = [...part.documents, ...fitment.conditions].some(
      (value) =>
        /approval|abe|registration|legal|teilegutachten|road/i.test(value),
    );
    if (legalConcern) {
      findings.push({
        id: `legal-${item.id}`,
        severity: "review",
        category: "legal",
        title: `Documentation check · ${part.name}`,
        detail:
          "Road-use documentation is incomplete or conditional. Verify the exact vehicle and combination before installation.",
        itemIds: [item.id],
      });
    }

    if (part.category === "Suspension") {
      findings.push({
        id: `alignment-${item.id}`,
        severity: "review",
        category: "dependency",
        title: "Alignment dependency",
        detail:
          "Suspension changes require a vehicle-specific installation check and wheel alignment before the build is considered complete.",
        itemIds: [item.id],
      });
    }
  }

  const wheels = structured.filter(
    (entry) => entry.part?.category === "Wheels",
  );
  const suspension = structured.filter(
    (entry) => entry.part?.category === "Suspension",
  );
  const brakes = structured.filter(
    (entry) => entry.part?.category === "Brakes",
  );

  for (const wheel of wheels) {
    for (const suspensionItem of suspension) {
      findings.push({
        id: `wheel-suspension-${wheel.item.id}-${suspensionItem.item.id}`,
        severity: "review",
        category: "interaction",
        title: "Wheel and suspension combination",
        detail:
          "Offset, width, tyre size, ride height, axle load and full steering travel must be checked together.",
        itemIds: [wheel.item.id, suspensionItem.item.id],
      });
    }
    for (const brake of brakes) {
      findings.push({
        id: `wheel-brake-${wheel.item.id}-${brake.item.id}`,
        severity: "review",
        category: "interaction",
        title: "Wheel and brake clearance",
        detail:
          "Diameter alone is insufficient. Confirm caliper template, barrel clearance and spoke clearance.",
        itemIds: [wheel.item.id, brake.item.id],
      });
    }
  }

  const severities = new Set(findings.map((finding) => finding.severity));
  return {
    status: severities.has("block")
      ? "blocked"
      : severities.has("review")
        ? "review_required"
        : "ready_for_next_step",
    findings,
    structuredItems: structured.length,
    unstructuredItems: unstructured.length,
  };
}
