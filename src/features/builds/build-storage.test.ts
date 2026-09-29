import { describe, expect, it } from "vitest";

import {
  createBuild,
  createBuildItem,
  getBuildItems,
  getVehicleBuilds,
  readBuildState,
  updateBuildDetails,
  updateBuildItemPlanning,
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

  it("updates the build brief without replacing its items", () => {
    const storage = memoryStorage();
    const build = createBuild(
      {
        vehicleId: "vehicle-1",
        name: "OEM Plus",
        goal: "OEM+ daily",
        description: "A clean and dependable daily-driver build.",
        budget: 3000,
      },
      storage,
      { id: "build-1", createdAt: "2026-09-04T10:00:00.000Z" },
    );
    createBuildItem(
      {
        buildId: build.id,
        title: "Wheels",
        stage: "appearance",
        priority: "next",
        estimatedCost: 800,
      },
      storage,
      { id: "item-1", createdAt: "2026-09-04T10:00:00.000Z" },
    );
    updateBuildDetails(
      build.id,
      {
        name: "Fast road",
        goal: "Handling",
        description:
          "A composed fast-road build with a clear installation order.",
        budget: 4500,
      },
      storage,
    );
    const state = readBuildState(storage);
    expect(state.builds[0]).toMatchObject({
      name: "Fast road",
      goal: "Handling",
      budget: 4500,
    });
    expect(state.items).toHaveLength(1);
  });

  it("rejects circular modification dependencies", () => {
    const storage = memoryStorage();
    const build = createBuild(
      {
        vehicleId: "vehicle-1",
        name: "OEM Plus",
        goal: "OEM+ daily",
        description: "A clean and dependable daily-driver build.",
        budget: 3000,
      },
      storage,
      { id: "build-1", createdAt: "2026-09-04T10:00:00.000Z" },
    );
    const first = createBuildItem(
      {
        buildId: build.id,
        title: "Brakes",
        stage: "handling",
        priority: "now",
        estimatedCost: 700,
      },
      storage,
      { id: "item-1", createdAt: "2026-09-04T10:00:00.000Z" },
    );
    const second = createBuildItem(
      {
        buildId: build.id,
        title: "Wheels",
        stage: "appearance",
        priority: "next",
        estimatedCost: 800,
      },
      storage,
      { id: "item-2", createdAt: "2026-09-04T11:00:00.000Z" },
    );
    updateBuildItemPlanning(
      build.id,
      first.id,
      {
        title: first.title,
        note: first.note,
        estimatedCost: first.estimatedCost,
        phaseId: "handling",
        targetDate: undefined,
        priority: first.priority,
        dependsOn: [second.id],
      },
      storage,
    );
    expect(() => updateBuildItemStatus(first.id, "installed", storage)).toThrow(
      "required modifications",
    );
    expect(() =>
      updateBuildItemPlanning(
        build.id,
        second.id,
        {
          title: second.title,
          note: second.note,
          estimatedCost: second.estimatedCost,
          phaseId: "appearance",
          targetDate: undefined,
          priority: second.priority,
          dependsOn: [first.id],
        },
        storage,
      ),
    ).toThrow("dependency creates a loop");
    updateBuildItemStatus(second.id, "installed", storage);
    updateBuildItemStatus(first.id, "installed", storage);
    expect(
      getBuildItems(build.id, storage).every(
        (item) => item.status === "installed",
      ),
    ).toBe(true);
  });

  it("keeps valid legacy records when one stored row is malformed", () => {
    const storage = memoryStorage();
    createBuild(
      {
        vehicleId: "vehicle-1",
        name: "OEM Plus",
        goal: "OEM+ daily",
        description: "A clean and dependable daily-driver build.",
        budget: 3000,
      },
      storage,
      { id: "build-1", createdAt: "2026-09-04T10:00:00.000Z" },
    );
    const state = readBuildState(storage);
    storage.setItem(
      "capcar.builds.v1",
      JSON.stringify({
        builds: [...state.builds, { broken: true }],
        items: [],
      }),
    );
    expect(readBuildState(storage).builds.map((build) => build.id)).toEqual([
      "build-1",
    ]);
  });
});
