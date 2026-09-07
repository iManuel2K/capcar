import { readBuildState } from "@/features/builds/build-storage";
import { findGuideBySlug } from "@/features/guides/guide-catalog";
import { readGuideProgress } from "@/features/guides/guide-progress";
import { maintenanceCatalog } from "@/features/maintenance/maintenance-catalog";
import { readMaintenanceRecords } from "@/features/maintenance/maintenance-storage";
import { findCatalogPart } from "@/features/parts/part-catalog";
import { findVehicle } from "@/features/vehicles/vehicle-storage";
import { readVehicleResolutions } from "@/features/vehicle-data/vehicle-resolution-storage";
import { readBuildVisuals } from "@/features/visualizer/build-visual-storage";
import { readTuningPlans } from "@/features/tuning/tuning-storage";
import { readDiagnostics } from "@/features/diagnostics/diagnostic-storage";
import { readInstallStamps } from "@/features/specialists/install-stamp-storage";

export const timelineCategories = [
  "vehicle",
  "maintenance",
  "build",
  "offer",
  "installation",
  "diagnostic",
] as const;

export type TimelineCategory = (typeof timelineCategories)[number];
export type VehicleTimelineEvent = {
  id: string;
  category: TimelineCategory;
  title: string;
  detail: string;
  occurredAt: string;
  value?: string;
};

type ReadableStorage = Pick<Storage, "getItem">;

export function buildVehicleTimeline(
  vehicleId: string,
  storage: ReadableStorage,
): VehicleTimelineEvent[] {
  const events: VehicleTimelineEvent[] = [];
  const vehicle = findVehicle(vehicleId, storage);
  if (vehicle) {
    events.push({
      id: `vehicle-${vehicle.id}`,
      category: "vehicle",
      title: "Vehicle added to Capcar",
      detail: `${vehicle.productionYear} ${vehicle.make} ${vehicle.model} · ${vehicle.platform}`,
      occurredAt: vehicle.createdAt,
      value: `${vehicle.mileage.toLocaleString("de-DE")} km`,
    });
  }

  for (const resolution of readVehicleResolutions(storage).filter(
    (candidate) => candidate.vehicleId === vehicleId,
  )) {
    events.push({
      id: `vehicle-resolution-${resolution.vehicleId}`,
      category: "vehicle",
      title: "Vehicle identity resolved",
      detail: `${resolution.provider} · ${resolution.confidence} confidence · ${resolution.source} source`,
      occurredAt: resolution.resolvedAt,
      value: `${resolution.identity.platform} · ${resolution.identity.engineCode}`,
    });
  }

  for (const plan of readTuningPlans(storage).filter(
    (candidate) => candidate.vehicleId === vehicleId,
  )) {
    events.push({
      id: `tuning-${plan.vehicleId}`,
      category: "build",
      title: "Beginner tuning roadmap generated",
      detail: `${plan.goal.replace("_", " ")} · ${plan.experience} · ${plan.stages.length} stages`,
      occurredAt: plan.generatedAt,
      value: formatEuro(plan.budget),
    });
  }

  for (const record of readMaintenanceRecords(storage).filter(
    (candidate) => candidate.vehicleId === vehicleId,
  )) {
    const template = maintenanceCatalog.find(
      (candidate) => candidate.key === record.taskKey,
    );
    events.push({
      id: `maintenance-${record.vehicleId}-${record.taskKey}-${record.updatedAt}`,
      category: "maintenance",
      title: template?.title ?? "Maintenance completed",
      detail: "Service completion recorded in the local maintenance history.",
      occurredAt: record.updatedAt,
      value: `${record.lastCompletedMileage.toLocaleString("de-DE")} km`,
    });
  }

  for (const record of readDiagnostics(storage).filter(
    (candidate) => candidate.vehicleId === vehicleId,
  )) {
    events.push({
      id: `diagnostic-${record.id}`,
      category: "diagnostic",
      title: `${record.code} · ${record.title}`,
      detail: `${record.severity} severity · ${record.status}${record.resolution ? ` · ${record.resolution}` : ""}`,
      occurredAt: record.updatedAt,
      value: `${record.mileage.toLocaleString("de-DE")} km`,
    });
  }

  for (const stamp of readInstallStamps(storage).filter(
    (candidate) => candidate.vehicleId === vehicleId,
  )) {
    events.push({
      id: `install-stamp-${stamp.id}`,
      category: "installation",
      title: `Beta shop stamp · ${stamp.work}`,
      detail: `${stamp.specialistName} · Partner verification workflow preview`,
      occurredAt: stamp.createdAt,
      value: stamp.installedAt,
    });
  }

  const state = readBuildState(storage);
  const builds = state.builds.filter((build) => build.vehicleId === vehicleId);
  const buildIds = new Set(builds.map((build) => build.id));
  for (const build of builds) {
    events.push({
      id: `build-${build.id}`,
      category: "build",
      title: `Build created · ${build.name}`,
      detail: `${build.goal} roadmap with a ${formatEuro(build.budget)} budget.`,
      occurredAt: build.createdAt,
    });
  }
  for (const visual of readBuildVisuals(storage).filter(
    (candidate) =>
      candidate.vehicleId === vehicleId && buildIds.has(candidate.buildId),
  )) {
    const build = builds.find((candidate) => candidate.id === visual.buildId);
    events.push({
      id: `visual-${visual.buildId}`,
      category: "build",
      title: `Build concept updated · ${build?.name ?? "Build"}`,
      detail: `${visual.paint} · ${visual.wheels} wheels · ${visual.stance} stance`,
      occurredAt: visual.updatedAt,
    });
  }
  for (const item of state.items.filter((candidate) =>
    buildIds.has(candidate.buildId),
  )) {
    const part = item.catalogPartId
      ? findCatalogPart(item.catalogPartId)
      : undefined;
    if (item.status === "installed") {
      events.push({
        id: `installed-${item.id}`,
        category: "installation",
        title: `Installed · ${item.title}`,
        detail:
          "Build item marked installed. Technical verification remains the owner's responsibility.",
        occurredAt: item.updatedAt ?? item.createdAt,
        value: formatEuro(item.deliveredPrice ?? item.estimatedCost),
      });
    } else if (item.selectedOfferId) {
      events.push({
        id: `offer-${item.id}`,
        category: "offer",
        title: `Demo offer selected · ${part?.name ?? item.title}`,
        detail: `${item.merchantName ?? "Demo merchant"} connected to the build. No purchase was made.`,
        occurredAt: item.offerSelectedAt ?? item.updatedAt ?? item.createdAt,
        value: formatEuro(item.deliveredPrice ?? item.estimatedCost),
      });
    } else {
      events.push({
        id: `item-${item.id}`,
        category: "build",
        title: `Planned · ${item.title}`,
        detail: `${item.stage} stage · ${item.priority} priority`,
        occurredAt: item.createdAt,
        value: formatEuro(item.estimatedCost),
      });
    }
  }

  for (const progress of readGuideProgress(storage).filter(
    (candidate) => candidate.vehicleId === vehicleId && candidate.completedAt,
  )) {
    const guide = findGuideBySlug(progress.guideSlug);
    events.push({
      id: `guide-${progress.vehicleId}-${progress.guideSlug}`,
      category: "installation",
      title: `Guide completed · ${guide?.title ?? progress.guideSlug}`,
      detail: `${progress.completedSteps.length} demo steps confirmed in ${progress.mode} mode.`,
      occurredAt: progress.completedAt!,
    });
  }

  return events.toSorted((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}
