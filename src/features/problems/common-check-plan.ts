import { buildItemSchema, buildSchema } from "@/features/builds/build-schema";
import {
  BUILD_STORAGE_KEY,
  readBuildState,
} from "@/features/builds/build-storage";
import { readVehicles } from "@/features/vehicles/vehicle-storage";
import type { AppLocale } from "@/i18n/config";
import { commonCheckCopy } from "./common-check-copy";
import { commonChecksForVehicle, type CommonCheckId } from "./common-checks";

export const commonCheckItemId = (vehicleId: string, checkId: CommonCheckId) =>
  `common-check:${vehicleId}:${checkId}`;

// Use the existing account-synced build store. A single write saves both records;
// stable IDs make repeated clicks and retries idempotent, including locale changes.
export function saveCommonCheck(
  vehicleId: string,
  checkId: CommonCheckId,
  locale: AppLocale,
  storage: Pick<Storage, "getItem" | "setItem">,
) {
  const vehicle = readVehicles(storage).find((car) => car.id === vehicleId);
  if (
    !vehicle ||
    !commonChecksForVehicle(vehicle).some((check) => check.id === checkId)
  )
    throw new Error("Check is not available for this vehicle.");
  const state = readBuildState(storage);
  const itemId = commonCheckItemId(vehicleId, checkId);
  const previous = state.items.find((item) => item.id === itemId);
  const previousBuild = state.builds.find(
    (build) => build.id === previous?.buildId && build.vehicleId === vehicleId,
  );
  if (previousBuild) return { build: previousBuild, created: false };
  const c = commonCheckCopy[locale];
  const buildId = `common-checks:${vehicleId}`;
  const existing = state.builds.find((build) => build.id === buildId);
  if (existing && existing.vehicleId !== vehicleId)
    throw new Error("Vehicle mismatch.");
  const now = new Date().toISOString();
  const build =
    existing ??
    buildSchema.parse({
      id: buildId,
      vehicleId,
      name: c.planName,
      description: c.planDescription,
      goal: "OEM+ daily",
      budget: 0,
      status: "planning",
      createdAt: now,
    });
  const item = buildItemSchema.parse({
    id: itemId,
    buildId,
    title: c.checks[checkId].title,
    note: c.checks[checkId].symptom,
    kind: "maintenance",
    stage: "foundation",
    priority: "next",
    estimatedCost: 0,
    estimatedCostKnown: false,
    status: "planned",
    createdAt: now,
  });
  // Reopen a finished checks plan when adding a different, still-planned task.
  const updatedBuild = {
    ...build,
    status:
      build.status === "complete" ? ("in_progress" as const) : build.status,
  };
  storage.setItem(
    BUILD_STORAGE_KEY,
    JSON.stringify({
      builds: existing
        ? state.builds.map((entry) =>
            entry.id === buildId ? updatedBuild : entry,
          )
        : [...state.builds, updatedBuild],
      items: [...state.items.filter((entry) => entry.id !== itemId), item],
    }),
  );
  return { build: updatedBuild, created: true };
}
