import { describe, expect, it } from "vitest";

import { getBuildMetrics } from "@/features/builds/build-metrics";
import type { Build, BuildItem } from "@/features/builds/build-schema";

describe("build metrics", () => {
  it("calculates planned cost, installed spend and progress", () => {
    const build: Build = {
      id: "build-1",
      vehicleId: "vehicle-1",
      name: "Stealth Rear",
      goal: "Appearance",
      description: "A darker and cleaner rear treatment.",
      budget: 1000,
      status: "in_progress",
      createdAt: "2026-09-04T10:00:00.000Z",
    };
    const items: BuildItem[] = [
      {
        id: "item-1",
        buildId: "build-1",
        title: "Lights",
        stage: "appearance",
        priority: "now",
        estimatedCost: 300,
        status: "installed",
        createdAt: "2026-09-04T10:00:00.000Z",
      },
      {
        id: "item-2",
        buildId: "build-1",
        title: "Diffuser",
        stage: "appearance",
        priority: "next",
        estimatedCost: 400,
        status: "planned",
        createdAt: "2026-09-04T10:00:00.000Z",
      },
    ];
    expect(getBuildMetrics(build, items)).toEqual({
      plannedTotal: 700,
      installedSpend: 300,
      remainingBudget: 300,
      progress: 50,
    });
  });
});
