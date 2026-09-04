import { describe, expect, it } from "vitest";

import {
  createBuild,
  createBuildItem,
  getBuildItems,
  getVehicleBuilds,
  updateBuildItemStatus,
} from "@/features/builds/build-storage";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("build storage", () => {
  it("keeps builds separated by vehicle", () => {
    const storage = memoryStorage();
    createBuild(
      {
        vehicleId: "vehicle-1",
        name: "OEM Plus",
        goal: "OEM+ daily",
        description: "A clean and dependable daily-driver build.",
        budget: 3000,
        status: "planning",
      },
      storage,
      { id: "build-1", createdAt: "2026-09-04T10:00:00.000Z" },
    );
    expect(getVehicleBuilds("vehicle-1", storage)).toHaveLength(1);
    expect(getVehicleBuilds("vehicle-2", storage)).toHaveLength(0);
  });

  it("tracks a modification through installation", () => {
    const storage = memoryStorage();
    createBuild(
      {
        vehicleId: "vehicle-1",
        name: "OEM Plus",
        goal: "OEM+ daily",
        description: "A clean and dependable daily-driver build.",
        budget: 3000,
        status: "planning",
      },
      storage,
      { id: "build-1", createdAt: "2026-09-04T10:00:00.000Z" },
    );
    createBuildItem(
      {
        buildId: "build-1",
        title: "Wheels",
        stage: "appearance",
        priority: "next",
        estimatedCost: 800,
        status: "planned",
      },
      storage,
      { id: "item-1", createdAt: "2026-09-04T10:00:00.000Z" },
    );
    updateBuildItemStatus("item-1", "installed", storage);
    expect(getBuildItems("build-1", storage)[0]?.status).toBe("installed");
  });
});
