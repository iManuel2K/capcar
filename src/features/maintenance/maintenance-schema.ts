import { z } from "zod";

import {
  maintenanceCategories,
  maintenanceCriticalities,
  type MaintenanceTemplate,
} from "@/features/maintenance/maintenance-catalog";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const maintenanceRecordSchema = z.object({
  vehicleId: z.string().min(1),
  taskKey: z.string().min(1),
  lastCompletedDate: isoDate,
  lastCompletedMileage: z.number().int().min(0).max(2_000_000),
  nextDueDate: isoDate.optional(),
  nextDueMileage: z.number().int().min(0).max(3_000_000).optional(),
  updatedAt: z.string().datetime(),
});

export type MaintenanceRecord = z.infer<typeof maintenanceRecordSchema>;

export type MaintenanceTask = MaintenanceTemplate & {
  id: string;
  vehicleId: string;
  category: (typeof maintenanceCategories)[number];
  criticality: (typeof maintenanceCriticalities)[number];
  record?: MaintenanceRecord;
};

export type MaintenanceStatus = "unknown" | "overdue" | "soon" | "good";
