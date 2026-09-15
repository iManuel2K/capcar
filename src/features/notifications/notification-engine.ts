import type { MaintenanceTask } from "@/features/maintenance/maintenance-schema";
import { getMaintenanceStatus } from "@/features/maintenance/maintenance-status";
import { addDaysToDate } from "@/features/maintenance/maintenance-status";
import type { NotificationItem } from "@/features/notifications/notification-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

export function createMaintenanceNotifications(
  vehicle: Vehicle,
  tasks: MaintenanceTask[],
  now = new Date(),
  daysBeforeDue = 30,
): NotificationItem[] {
  const today = now.toISOString().slice(0, 10);
  return tasks.flatMap((task) => {
    const urgency = getMaintenanceStatus(task, vehicle.mileage, today);
    if (urgency !== "overdue" && urgency !== "soon") return [];
    if (urgency === "soon") {
      const dateIsWithinLead = Boolean(
        task.record?.nextDueDate &&
        task.record.nextDueDate <= addDaysToDate(today, daysBeforeDue),
      );
      const mileageIsWithinLead = Boolean(
        task.record?.nextDueMileage &&
        task.record.nextDueMileage <= vehicle.mileage + 1_500,
      );
      if (!dateIsWithinLead && !mileageIsWithinLead) return [];
    }
    const targets = [
      task.record?.nextDueDate ? `date ${task.record.nextDueDate}` : undefined,
      task.record?.nextDueMileage
        ? `${task.record.nextDueMileage.toLocaleString("en-US")} km`
        : undefined,
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
