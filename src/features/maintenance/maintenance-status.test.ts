import { describe, expect, it } from "vitest";

import type { MaintenanceTask } from "@/features/maintenance/maintenance-schema";
import {
  addMonthsToDate,
  getMaintenanceStatus,
} from "@/features/maintenance/maintenance-status";

const baseTask: MaintenanceTask = {
  id: "vehicle:oil",
  vehicleId: "vehicle",
  key: "oil",
  title: "Oil",
  description: "Oil service",
  category: "Engine",
  criticality: "attention",
  intervalKm: 15_000,
  intervalMonths: 12,
};

describe("maintenance status", () => {
  it("keeps missing history distinct from overdue work", () => {
    expect(getMaintenanceStatus(baseTask, 100_000, "2026-09-04")).toBe(
      "unknown",
    );
  });

  it("uses both mileage and date targets", () => {
    const task: MaintenanceTask = {
      ...baseTask,
      record: {
        vehicleId: "vehicle",
        taskKey: "oil",
        lastCompletedDate: "2025-09-01",
        lastCompletedMileage: 85_000,
        nextDueDate: "2026-09-01",
        nextDueMileage: 100_000,
        updatedAt: "2026-09-04T10:00:00.000Z",
      },
    };

    expect(getMaintenanceStatus(task, 99_500, "2026-09-04")).toBe("overdue");
  });

  it("detects work due within 1,500 kilometres", () => {
    const task: MaintenanceTask = {
      ...baseTask,
      record: {
        vehicleId: "vehicle",
        taskKey: "oil",
        lastCompletedDate: "2026-01-01",
        lastCompletedMileage: 85_000,
        nextDueDate: "2027-01-01",
        nextDueMileage: 100_000,
        updatedAt: "2026-09-04T10:00:00.000Z",
      },
    };

    expect(getMaintenanceStatus(task, 99_000, "2026-09-04")).toBe("soon");
  });

  it("adds service months as an ISO date", () => {
    expect(addMonthsToDate("2026-09-04", 12)).toBe("2027-09-04");
    expect(addMonthsToDate("2026-01-31", 1)).toBe("2026-02-28");
  });
});
