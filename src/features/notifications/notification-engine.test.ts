import { describe, expect, it } from "vitest";

import type { MaintenanceTask } from "@/features/maintenance/maintenance-schema";
import {
  createMaintenanceNotifications,
  isWithinQuietHours,
} from "@/features/notifications/notification-engine";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

const vehicle = {
  id: "vehicle-1",
  make: "BMW",
  model: "318i",
  platform: "E90",
  bodyStyle: "Sedan",
  productionYear: 2011,
  engineCode: "N43",
  transmission: "Manual",
  mileage: 150000,
  vin: "",
  imageUrl: "",
  createdAt: "2026-09-05T00:00:00.000Z",
} as Vehicle;

const task = {
  id: "vehicle-1:oil",
  vehicleId: "vehicle-1",
  key: "oil",
  title: "Engine oil",
  category: "Engine",
  criticality: "attention",
  description: "Oil service",
  intervalMonths: 12,
  intervalKm: 15000,
  record: {
    vehicleId: "vehicle-1",
    taskKey: "oil",
    lastCompletedDate: "2025-01-01",
    lastCompletedMileage: 130000,
    nextDueDate: "2026-01-01",
    nextDueMileage: 145000,
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
} as MaintenanceTask;

describe("notification engine", () => {
  it("creates an overdue reminder from a due task", () => {
    const items = createMaintenanceNotifications(
      vehicle,
      [task],
      new Date("2026-09-05T10:00:00.000Z"),
    );
    expect(items).toHaveLength(1);
    expect(items[0].urgency).toBe("overdue");
    expect(items[0].href).toBe("/garage/vehicle-1/maintenance");
  });

  it("supports quiet hours that cross midnight", () => {
    expect(isWithinQuietHours(23, 0, "21:00", "08:00")).toBe(true);
    expect(isWithinQuietHours(7, 59, "21:00", "08:00")).toBe(true);
    expect(isWithinQuietHours(12, 0, "21:00", "08:00")).toBe(false);
  });

  it("does not send mileage reminders when mileage is disabled or unknown", () => {
    const now = new Date("2025-09-05T10:00:00Z");
    const onlyMileage = {
      serviceByDate: false,
      serviceByMileage: true,
      kmBeforeDue: 1500,
    };
    expect(
      createMaintenanceNotifications(vehicle, [task], now, 30, onlyMileage),
    ).toHaveLength(1);
    expect(
      createMaintenanceNotifications(
        { ...vehicle, mileageKnown: false },
        [task],
        now,
        30,
        onlyMileage,
      ),
    ).toHaveLength(0);
    expect(
      createMaintenanceNotifications(vehicle, [task], now, 30, {
        ...onlyMileage,
        serviceByMileage: false,
      }),
    ).toHaveLength(0);
  });

  it("uses the chosen lead without borrowing urgency from a disabled trigger", () => {
    const now = new Date("2025-09-05T10:00:00Z");
    const onlyDate = {
      serviceByDate: true,
      serviceByMileage: false,
      kmBeforeDue: 1500,
    };
    expect(
      createMaintenanceNotifications(vehicle, [task], now, 30, onlyDate),
    ).toHaveLength(0);
    expect(
      createMaintenanceNotifications(vehicle, [task], now, 140, onlyDate)[0],
    ).toMatchObject({
      urgency: "soon",
      detail: "Planning target: 2026-01-01.",
    });
  });
});
