import { maintenanceCatalog } from "@/features/maintenance/maintenance-catalog";
import type {
  MaintenanceRecord,
  MaintenanceTask,
} from "@/features/maintenance/maintenance-schema";
import { maintenanceRecordSchema } from "@/features/maintenance/maintenance-schema";
import { addMonthsToDate } from "@/features/maintenance/maintenance-status";

export const MAINTENANCE_STORAGE_KEY = "capcar.maintenance.v1";
export const MAINTENANCE_STORAGE_EVENT = "capcar:maintenance-changed";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

export function readMaintenanceRecords(
  storage: ReadableStorage,
): MaintenanceRecord[] {
  const raw = storage.getItem(MAINTENANCE_STORAGE_KEY);
  if (!raw) return [];

  try {
    const result = maintenanceRecordSchema.array().safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function getMaintenanceTasks(
  vehicleId: string,
  storage: ReadableStorage,
): MaintenanceTask[] {
  const records = readMaintenanceRecords(storage);
  return maintenanceCatalog.map((template) => ({
    ...template,
    id: `${vehicleId}:${template.key}`,
    vehicleId,
    record: records.find(
      (record) =>
        record.vehicleId === vehicleId && record.taskKey === template.key,
    ),
  }));
}

export function completeMaintenanceTask(
  input: {
    vehicleId: string;
    taskKey: string;
    completedDate: string;
    completedMileage: number;
  },
  storage: WritableStorage,
  now = new Date().toISOString(),
): MaintenanceRecord {
  const template = maintenanceCatalog.find(
    (item) => item.key === input.taskKey,
  );
  if (!template) throw new Error("Unknown maintenance task");

  const record = maintenanceRecordSchema.parse({
    vehicleId: input.vehicleId,
    taskKey: input.taskKey,
    lastCompletedDate: input.completedDate,
    lastCompletedMileage: input.completedMileage,
    nextDueDate: template.intervalMonths
      ? addMonthsToDate(input.completedDate, template.intervalMonths)
      : undefined,
    nextDueMileage: template.intervalKm
      ? input.completedMileage + template.intervalKm
      : undefined,
    updatedAt: now,
  });

  const records = readMaintenanceRecords(storage).filter(
    (current) =>
      !(
        current.vehicleId === input.vehicleId &&
        current.taskKey === input.taskKey
      ),
  );
  storage.setItem(
    MAINTENANCE_STORAGE_KEY,
    JSON.stringify([record, ...records]),
  );
  return record;
}

export function loadSampleMaintenanceHistory(
  vehicleId: string,
  currentMileage: number,
  storage: WritableStorage,
  today = new Date().toISOString().slice(0, 10),
) {
  const examples = [
    { taskKey: "engine-oil-filter", monthsAgo: 10, kmAgo: 13_900 },
    { taskKey: "brake-fluid", monthsAgo: 26, kmAgo: 18_000 },
    { taskKey: "coolant", monthsAgo: 30, kmAgo: 25_000 },
    { taskKey: "cabin-filter", monthsAgo: 5, kmAgo: 6_000 },
    { taskKey: "tyres", monthsAgo: 3, kmAgo: 4_000 },
  ];

  for (const example of examples) {
    completeMaintenanceTask(
      {
        vehicleId,
        taskKey: example.taskKey,
        completedDate: addMonthsToDate(today, -example.monthsAgo),
        completedMileage: Math.max(0, currentMileage - example.kmAgo),
      },
      storage,
    );
  }
}

export function announceMaintenanceChange() {
  window.dispatchEvent(new Event(MAINTENANCE_STORAGE_EVENT));
}
