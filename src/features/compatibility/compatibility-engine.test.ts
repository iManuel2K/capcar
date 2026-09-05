import { describe, expect, it } from "vitest";

import type { BuildItem } from "@/features/builds/build-schema";
import { evaluateBuildCompatibility } from "@/features/compatibility/compatibility-engine";

const vehicle = {
  platform: "E90",
  productionYear: 2011,
  bodyStyle: "Sedan" as const,
  engineCode: "N43",
};

function item(
  id: string,
  catalogPartId: string,
  title = catalogPartId,
): BuildItem {
  return {
    id,
    buildId: "build-1",
    title,
    catalogPartId,
    stage: "handling",
    priority: "next",
    estimatedCost: 500,
    status: "planned",
    createdAt: "2026-09-05T10:00:00.000Z",
  };
}

describe("build compatibility engine", () => {
  it("blocks a structured vehicle mismatch", () => {
    const report = evaluateBuildCompatibility({
      vehicle,
      items: [item("g20", "demo-g20-splitter")],
    });
    expect(report.status).toBe("blocked");
    expect(
      report.findings.some((finding) => finding.severity === "block"),
    ).toBe(true);
  });

  it("detects wheel, suspension and brake interactions", () => {
    const report = evaluateBuildCompatibility({
      vehicle,
      items: [
        item("wheel", "demo-18-wheel-set-e9x"),
        item("suspension", "demo-street-coilovers-e9x"),
        item("brakes", "demo-front-brake-kit-e9x"),
      ],
    });
    expect(report.status).toBe("review_required");
    expect(
      report.findings.some(
        (finding) => finding.id === "wheel-suspension-wheel-suspension",
      ),
    ).toBe(true);
    expect(
      report.findings.some(
        (finding) => finding.id === "wheel-brake-wheel-brakes",
      ),
    ).toBe(true);
  });

  it("requires manual roadmap items to be connected to catalogue data", () => {
    const manual: BuildItem = {
      ...item("manual", "demo-intake-n43", "Custom item"),
      catalogPartId: undefined,
    };
    const report = evaluateBuildCompatibility({ vehicle, items: [manual] });
    expect(report.unstructuredItems).toBe(1);
    expect(report.status).toBe("review_required");
  });
});
