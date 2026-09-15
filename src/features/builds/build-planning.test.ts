import { describe, expect, it } from "vitest";
import { getConnectedBuildMetrics, planningForBuild } from "./build-planning";
import { buildSchema, buildItemSchema } from "./build-schema";

const createdAt = "2026-09-15T10:00:00.000Z";
const build = buildSchema.parse({
  id: "build",
  vehicleId: "vehicle",
  name: "OEM+ daily",
  goal: "OEM+ daily",
  description: "A documented street build with sensible dependencies.",
  budget: 2_000,
  status: "in_progress",
  createdAt,
});

describe("connected build planning", () => {
  it("upgrades legacy builds with the established phase order", () => {
    expect(planningForBuild(build).phases.map((phase) => phase.id)).toEqual([
      "foundation",
      "handling",
      "appearance",
      "performance",
    ]);
  });

  it("separates planned, committed and paid values and skips blocked work", () => {
    const first = buildItemSchema.parse({
      id: "baseline",
      buildId: build.id,
      title: "Maintenance baseline",
      stage: "foundation",
      priority: "now",
      estimatedCost: 300,
      deliveredPrice: 280,
      status: "installed",
      createdAt,
      workbench: {
        purchase: {
          orderedAt: "2026-09-10",
          deliveredAt: "2026-09-11",
          installedAt: "2026-09-12",
          mileage: 100_000,
          amount: 275,
          refunded: 25,
          accounting: "include",
          updatedAt: createdAt,
        },
      },
    });
    const blocked = buildItemSchema.parse({
      id: "wheels",
      buildId: build.id,
      title: "Wheel package",
      stage: "appearance",
      priority: "now",
      estimatedCost: 1_000,
      dependsOn: ["alignment"],
      status: "planned",
      createdAt,
    });
    const next = buildItemSchema.parse({
      id: "alignment",
      buildId: build.id,
      title: "Alignment check",
      stage: "handling",
      priority: "next",
      estimatedCost: 120,
      status: "planned",
      createdAt,
    });
    const metrics = getConnectedBuildMetrics(build, [first, blocked, next]);
    expect(metrics).toMatchObject({
      planned: 1_420,
      committed: 280,
      paid: 250,
      progress: 33,
      next: { id: "alignment" },
    });
    expect(metrics.blocked.map((item) => item.id)).toEqual(["wheels"]);
  });
});
