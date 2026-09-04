import type {
  MaintenanceStatus,
  MaintenanceTask,
} from "@/features/maintenance/maintenance-schema";

function dateToUtc(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

export function addMonthsToDate(date: string, months: number) {
  const value = dateToUtc(date);
  const originalDay = value.getUTCDate();
  value.setUTCDate(1);
  value.setUTCMonth(value.getUTCMonth() + months);
  const finalDayOfMonth = new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 0),
  ).getUTCDate();
  value.setUTCDate(Math.min(originalDay, finalDayOfMonth));
  return value.toISOString().slice(0, 10);
}

export function addDaysToDate(date: string, days: number) {
  const value = dateToUtc(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function getMaintenanceStatus(
  task: MaintenanceTask,
  currentMileage: number,
  today = new Date().toISOString().slice(0, 10),
): MaintenanceStatus {
  if (!task.record) return "unknown";

  const overdueByDate = Boolean(
    task.record.nextDueDate && task.record.nextDueDate <= today,
  );
  const overdueByMileage = Boolean(
    task.record.nextDueMileage && task.record.nextDueMileage <= currentMileage,
  );
  if (overdueByDate || overdueByMileage) return "overdue";

  const soonByDate = Boolean(
    task.record.nextDueDate &&
    task.record.nextDueDate <= addDaysToDate(today, 60),
  );
  const soonByMileage = Boolean(
    task.record.nextDueMileage &&
    task.record.nextDueMileage <= currentMileage + 1_500,
  );
  if (soonByDate || soonByMileage) return "soon";

  return "good";
}
