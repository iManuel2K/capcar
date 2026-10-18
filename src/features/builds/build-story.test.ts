import { beforeEach, describe, expect, it } from "vitest";
import { createBuild, createBuildItem, readBuildState } from "./build-storage";
import {
  saveBuildCompletion,
  reopenBuildCompletion,
  shareCardData,
  storyMilestones,
} from "./build-story";
import { getConnectedBuildMetrics } from "./build-planning";
import { readCostState } from "@/features/costs/cost-storage";
import { buildVehicleTimeline } from "@/features/timeline/vehicle-timeline";
import { buildVehiclePassport } from "@/features/passport/vehicle-passport";
import { saveVehicle } from "@/features/vehicles/vehicle-storage";
import { updateWorkbench } from "./build-workbench";
import { workbenchSchema } from "./build-workbench-schema";
const now = "2026-10-18T12:00:00.000Z";
function setup(purchase = false) {
  const vehicle = saveVehicle(
    {
      make: "BMW",
      model: "318i",
      platform: "E90",
      engineCode: "N43",
      productionYear: 2011,
      bodyStyle: "Sedan",
      transmission: "Manual",
      mileage: 100000,
      vin: "WBA12345678901234",
      photoDataUrl: "data:image/jpeg;base64,/9j/AA==",
    },
    localStorage,
  );
  const build = createBuild(
    {
      vehicleId: vehicle.id,
      name: "Private owner project",
      goal: "OEM+ daily",
      description: "A private planned vehicle project.",
      budget: 1000,
    },
    localStorage,
  );
  const item = createBuildItem(
    {
      buildId: build.id,
      title: "Oil service private plate ABC123",
      kind: "maintenance",
      stage: "foundation",
      priority: "now",
      estimatedCost: 100,
      status: purchase ? "ordered" : "planned",
      ...(purchase
        ? {
            workbench: workbenchSchema.parse({
              purchase: {
                orderedAt: "2026-10-01",
                deliveredAt: "2026-10-02",
                amount: 80,
                refunded: 0,
                accounting: "include",
                updatedAt: now,
              },
            }),
          }
        : {}),
    },
    localStorage,
  );
  return { vehicle, build, item };
}
beforeEach(() => localStorage.clear());
describe("connected owner build story", () => {
  it("derives one timeline entry, one expense and real progress, even after repeated completion and correction", () => {
    const { vehicle, build, item } = setup();
    const input = {
      completedOn: "2026-10-17",
      note: "Private home location",
      actualCost: 125.5,
      beforePhoto: "data:image/jpeg;base64,/9j/AA==",
      afterPhoto: "data:image/jpeg;base64,/9j/AA==",
    };
    saveBuildCompletion(
      vehicle.id,
      build.id,
      item.id,
      input,
      localStorage,
      now,
    );
    saveBuildCompletion(
      vehicle.id,
      build.id,
      item.id,
      { ...input, actualCost: 130 },
      localStorage,
      now,
    );
    const items = readBuildState(localStorage).items;
    expect(getConnectedBuildMetrics(build, items)).toMatchObject({
      progress: 100,
      paid: 130,
      planned: 100,
      forecast: 130,
    });
    expect(readCostState(localStorage).entries).toHaveLength(1);
    expect(readCostState(localStorage).entries[0].amount).toBe(130);
    const events = buildVehicleTimeline(vehicle.id, localStorage).filter(
      (entry) => entry.id === `installed-${item.id}`,
    );
    expect(events).toHaveLength(1);
    expect(events[0].completion?.beforePhoto).toBe(input.beforePhoto);
    expect(storyMilestones(items)).toMatchObject({
      firstMaintenance: true,
      firstWork: true,
      stages: ["foundation"],
    });
  });
  it("undoes a standalone completion and safely completes again without a duplicate expense", () => {
    const { vehicle, build, item } = setup();
    const input = { completedOn: "2026-10-17", actualCost: 90 };
    saveBuildCompletion(
      vehicle.id,
      build.id,
      item.id,
      input,
      localStorage,
      now,
    );
    reopenBuildCompletion(vehicle.id, build.id, item.id, localStorage);
    expect(readCostState(localStorage).entries).toHaveLength(0);
    expect(
      buildVehicleTimeline(vehicle.id, localStorage).some(
        (event) => event.id === `installed-${item.id}`,
      ),
    ).toBe(false);
    expect(shareCardData(readBuildState(localStorage).items).progress).toBe(0);
    saveBuildCompletion(
      vehicle.id,
      build.id,
      item.id,
      input,
      localStorage,
      now,
    );
    expect(readCostState(localStorage).entries).toHaveLength(1);
  });
  it("reconciles purchase, total completion cost, correction and refund into one cost", () => {
    const { vehicle, build, item } = setup(true);
    saveBuildCompletion(
      vehicle.id,
      build.id,
      item.id,
      { completedOn: "2026-10-17", actualCost: 120 },
      localStorage,
      now,
    );
    expect(
      readCostState(localStorage).entries.map((entry) => entry.amount),
    ).toEqual([120]);
    updateWorkbench(vehicle.id, build.id, item.id, localStorage, (current) => ({
      ...current,
      purchase: { ...current.purchase!, refunded: 10 },
    }));
    expect(
      readCostState(localStorage).entries.map((entry) => entry.amount),
    ).toEqual([110]);
    reopenBuildCompletion(vehicle.id, build.id, item.id, localStorage);
    expect(
      readCostState(localStorage).entries.map((entry) => entry.amount),
    ).toEqual([70]);
  });
  it("respects already-recorded accounting and rejects future, invalid and pre-delivery completions", () => {
    const { vehicle, build, item } = setup(true);
    for (const input of [
      { completedOn: "2026-11-01" },
      { completedOn: "2026-02-30" },
      { completedOn: "2026-09-01" },
      { completedOn: "2026-10-17", actualCost: 60 },
    ])
      expect(() =>
        saveBuildCompletion(
          vehicle.id,
          build.id,
          item.id,
          input,
          localStorage,
          now,
        ),
      ).toThrow();
    updateWorkbench(vehicle.id, build.id, item.id, localStorage, (current) => ({
      ...current,
      purchase: { ...current.purchase!, accounting: "already-recorded" },
    }));
    saveBuildCompletion(
      vehicle.id,
      build.id,
      item.id,
      { completedOn: "2026-10-17", actualCost: 100 },
      localStorage,
      now,
    );
    expect(readCostState(localStorage).entries).toHaveLength(0);
  });
  it("does not put private notes, photos, VIN, title or vehicle details into the share card or Passport", () => {
    const { vehicle, build, item } = setup();
    saveBuildCompletion(
      vehicle.id,
      build.id,
      item.id,
      {
        completedOn: "2026-10-17",
        note: "PRIVATE ADDRESS",
        beforePhoto: "data:image/jpeg;base64,/9j/AA==",
        actualCost: 95,
      },
      localStorage,
      now,
    );
    expect(shareCardData(readBuildState(localStorage).items)).toEqual({
      completed: 1,
      total: 1,
      progress: 100,
    });
    const passport = buildVehiclePassport(vehicle.id, localStorage)!;
    expect(JSON.stringify(passport)).not.toMatch(
      /PRIVATE ADDRESS|data:image|WBA12345678901234/,
    );
    expect(passport.modifications[0]).toMatchObject({
      cost: 95,
      verification: "Owner-recorded maintenance",
      installedAt: "2026-10-17",
    });
  });
  it("refuses another vehicle and blocked dependencies, with no partial writes", () => {
    const { vehicle, build, item } = setup();
    expect(() =>
      saveBuildCompletion(
        "other",
        build.id,
        item.id,
        { completedOn: "2026-10-17" },
        localStorage,
        now,
      ),
    ).toThrow("ownership");
    const blocked = createBuildItem(
      {
        buildId: build.id,
        title: "Suspension",
        stage: "handling",
        priority: "next",
        estimatedCost: 500,
        dependsOn: [item.id],
      },
      localStorage,
    );
    expect(() =>
      saveBuildCompletion(
        vehicle.id,
        build.id,
        blocked.id,
        { completedOn: "2026-10-17" },
        localStorage,
        now,
      ),
    ).toThrow("dependencies");
    expect(
      readBuildState(localStorage).items.every(
        (entry) => entry.status === "planned",
      ),
    ).toBe(true);
  });
  it("treats zero actual cost as recorded, never as an estimate or an invalid expense", () => {
    const { vehicle, build, item } = setup();
    saveBuildCompletion(
      vehicle.id,
      build.id,
      item.id,
      { completedOn: "2026-10-17", actualCost: 0 },
      localStorage,
      now,
    );
    expect(
      getConnectedBuildMetrics(build, readBuildState(localStorage).items),
    ).toMatchObject({ paid: 0, forecast: 0 });
    expect(readCostState(localStorage).entries).toHaveLength(0);
  });
});
