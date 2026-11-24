import type { MaintenanceTask } from "@/features/maintenance/maintenance-schema";
import { addDaysToDate } from "@/features/maintenance/maintenance-status";
import type { NotificationItem } from "@/features/notifications/notification-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

export function createMaintenanceNotifications(
  vehicle: Vehicle,
  tasks: MaintenanceTask[],
  now = new Date(),
  daysBeforeDue = 30,
  triggers = {
    serviceByDate: true,
    serviceByMileage: true,
    kmBeforeDue: 1_500,
  },
): NotificationItem[] {
  const today = now.toISOString().slice(0, 10);
  return tasks.flatMap((task) => {
    const date = triggers.serviceByDate ? task.record?.nextDueDate : undefined;
    const mileage =
      triggers.serviceByMileage && vehicle.mileageKnown !== false
        ? task.record?.nextDueMileage
        : undefined;
    const dateNear =
      date !== undefined && date <= addDaysToDate(today, daysBeforeDue);
    const mileageNear =
      mileage !== undefined &&
      mileage <= vehicle.mileage + triggers.kmBeforeDue;
    if (!dateNear && !mileageNear) return [];
    const urgency =
      (date !== undefined && date <= today) ||
      (mileage !== undefined && mileage <= vehicle.mileage)
        ? "overdue"
        : "soon";
    const targets = [
      dateNear ? date : undefined,
      mileageNear ? `${mileage.toLocaleString("en-US")} km` : undefined,
    ].filter(Boolean);
    const target = targets.join(" or ") || "the current planning interval";
    return [
      {
        id: `${vehicle.id}:${task.key}:${urgency}:${task.record?.nextDueDate ?? "none"}:${task.record?.nextDueMileage ?? "none"}`,
        vehicleId: vehicle.id,
        vehicleLabel: `${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`,
        taskKey: task.key,
        category: "maintenance",
        title: `${task.title} ${urgency === "overdue" ? "is due" : "is coming up"}`,
        urgency,
        detail: `Planning target: ${target}.`,
        href: `/garage/${vehicle.id}/maintenance`,
        createdAt: now.toISOString(),
      } satisfies NotificationItem,
    ];
  });
}

export function isWithinQuietHours(
  hour: number,
  minute: number,
  start: string,
  end: string,
) {
  const value = hour * 60 + minute;
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const startValue = startHour * 60 + startMinute;
  const endValue = endHour * 60 + endMinute;
  return startValue <= endValue
    ? value >= startValue && value < endValue
    : value >= startValue || value < endValue;
}
