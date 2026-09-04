import { describe, expect, it } from "vitest";

import {
  completeMaintenanceTask,
  getMaintenanceTasks,
} from "@/features/maintenance/maintenance-storage";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("maintenance storage", () => {
  it("provides the complete starter checklist without persisting seed rows", () => {
    const storage = memoryStorage();
    const tasks = getMaintenanceTasks("vehicle-1", storage);

    expect(tasks).toHaveLength(11);
    expect(tasks.every((task) => task.vehicleId === "vehicle-1")).toBe(true);
  });

  it("calculates and restores the next oil service", () => {
    const storage = memoryStorage();
    completeMaintenanceTask(
      {
        vehicleId: "vehicle-1",
        taskKey: "engine-oil-filter",
        completedDate: "2026-09-04",
        completedMileage: 148_200,
      },
      storage,
      "2026-09-04T12:00:00.000Z",
    );

    const oil = getMaintenanceTasks("vehicle-1", storage).find(
      (task) => task.key === "engine-oil-filter",
    );
    expect(oil?.record).toMatchObject({
      nextDueDate: "2027-09-04",
      nextDueMileage: 163_200,
    });
  });
});
