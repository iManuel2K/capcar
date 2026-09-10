"use client";
import { useBuildState } from "@/features/builds/use-builds";
import { useMaintenanceTasks } from "@/features/maintenance/use-maintenance-tasks";
import { getMaintenanceStatus } from "@/features/maintenance/maintenance-status";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import { GarageOverviewGrid } from "./garage-overview-grid";

export function VehicleOverviewSummary({ vehicle }: { vehicle: Vehicle }) {
  const { builds, items } = useBuildState();
  const tasks = useMaintenanceTasks(vehicle.id);
  const ownBuilds = builds.filter((build) => build.vehicleId === vehicle.id);
  const ids = new Set(ownBuilds.map((build) => build.id));
  const priorities = { overdue: 0, soon: 1, unknown: 2, good: 3 };
  const next = tasks.toSorted(
    (a, b) =>
      priorities[getMaintenanceStatus(a, vehicle.mileage)] -
        priorities[getMaintenanceStatus(b, vehicle.mileage)] ||
      (a.record?.nextDueDate ?? "9999").localeCompare(
        b.record?.nextDueDate ?? "9999",
      ) ||
      (a.record?.nextDueMileage ?? Infinity) -
        (b.record?.nextDueMileage ?? Infinity),
  )[0];
  const status = next ? getMaintenanceStatus(next, vehicle.mileage) : "unknown";
  const due = [
    next?.record?.nextDueMileage === undefined
      ? null
      : `${next.record.nextDueMileage.toLocaleString("en-GB")} km`,
    next?.record?.nextDueDate,
  ]
    .filter(Boolean)
    .join(" or ");
  return (
    <GarageOverviewGrid
      data={{
        name: `${vehicle.make} ${vehicle.platform} ${vehicle.model}`,
        specs: `${vehicle.productionYear} · ${vehicle.engineCode} · ${vehicle.transmission}`,
        mileage: vehicle.mileage,
        budget: ownBuilds.reduce((sum, build) => sum + build.budget, 0),
        plannedCost: items
          .filter((item) => ids.has(item.buildId))
          .reduce(
            (sum, item) => sum + (item.deliveredPrice ?? item.estimatedCost),
            0,
          ),
        nextAction: next?.title ?? "Review service history",
        serviceDue:
          status === "unknown"
            ? "Log the last service to establish the next interval."
            : due
              ? `${status === "overdue" ? "Overdue" : "Due"}: ${due}${next?.record?.nextDueDate && next.record.nextDueMileage !== undefined ? " · whichever comes first" : ""}`
              : "Set the next service interval.",
        serviceUrgent: status === "overdue" || status === "soon",
        demo: vehicle.demoProject,
      }}
    />
  );
}
