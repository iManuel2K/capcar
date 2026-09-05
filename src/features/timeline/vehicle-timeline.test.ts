import { describe, expect, it } from "vitest";

import { createBuild, createBuildItem } from "@/features/builds/build-storage";
import { saveGuideProgress } from "@/features/guides/guide-progress";
import { completeMaintenanceTask } from "@/features/maintenance/maintenance-storage";
import { buildVehicleTimeline } from "@/features/timeline/vehicle-timeline";
import { saveVehicle } from "@/features/vehicles/vehicle-storage";

describe("vehicle timeline", () => {
  it("combines vehicle, maintenance, build and guide history newest first", () => {
    const storage = window.localStorage;
    storage.clear();
    const vehicle = saveVehicle(
      {
        make: "BMW",
        model: "318i",
        productionYear: 2011,
        platform: "E90",
        bodyStyle: "Sedan",
        engineCode: "N43",
        transmission: "Manual",
        mileage: 142000,
      },
      storage,
      { id: "vehicle-1", createdAt: "2026-01-01T08:00:00.000Z" },
    );
    completeMaintenanceTask(
      {
        vehicleId: vehicle.id,
        taskKey: "engine-oil-filter",
        completedDate: "2026-01-02",
        completedMileage: 142000,
      },
      storage,
      "2026-01-02T10:00:00.000Z",
    );
    const build = createBuild(
      {
        vehicleId: vehicle.id,
        name: "OEM plus",
        goal: "OEM+ daily",
        description: "A careful and coherent project roadmap.",
        budget: 3000,
        status: "planning",
      },
      storage,
      { id: "build-1", createdAt: "2026-01-03T10:00:00.000Z" },
    );
    createBuildItem(
      {
        buildId: build.id,
        title: "Panel filter",
        stage: "performance",
        priority: "next",
        estimatedCost: 74,
        status: "planned",
      },
      storage,
      { id: "item-1", createdAt: "2026-01-04T10:00:00.000Z" },
    );
    saveGuideProgress(
      {
        vehicleId: vehicle.id,
        guideSlug: "demo-n43-panel-filter",
        mode: "beginner",
        safetyAccepted: true,
        completedSteps: ["compare", "open", "install", "close"],
        completedAt: "2026-01-05T10:00:00.000Z",
      },
      storage,
      "2026-01-05T10:00:00.000Z",
    );

    const events = buildVehicleTimeline(vehicle.id, storage);
    expect(events.map((event) => event.category)).toEqual([
      "installation",
      "build",
      "build",
      "maintenance",
      "vehicle",
    ]);
    expect(events[0].title).toContain("Guide completed");
  });
});
