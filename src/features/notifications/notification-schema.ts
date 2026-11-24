import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  enabled: z.boolean(),
  maintenanceReminders: z.boolean(),
  priceWatchAlerts: z.boolean().default(true),
  daysBeforeDue: z.number().int().min(1).max(180),
  serviceByDate: z.boolean().default(true),
  serviceByMileage: z.boolean().default(true),
  kmBeforeDue: z.number().int().min(1).max(20_000).default(1_500),
  quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export const notificationItemSchema = z.object({
  id: z.string().min(1),
  vehicleId: z.string().min(1),
  vehicleLabel: z.string().min(1),
  taskKey: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(["maintenance", "price-watch"]).default("maintenance"),
  urgency: z.enum(["overdue", "soon", "info"]),
  detail: z.string().min(1),
  href: z.string().startsWith("/"),
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().optional(),
});

export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;
export type NotificationItem = z.infer<typeof notificationItemSchema>;

export const defaultNotificationPreferences: NotificationPreferences = {
  enabled: true,
  maintenanceReminders: false,
  priceWatchAlerts: true,
  daysBeforeDue: 30,
  serviceByDate: true,
  serviceByMileage: true,
  kmBeforeDue: 1_500,
  quietHoursStart: "21:00",
  quietHoursEnd: "08:00",
};
