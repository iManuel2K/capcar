import {
  buildCompletionSchema,
  buildItemSchema,
  type BuildItem,
} from "./build-schema";
import { BUILD_STORAGE_KEY, readBuildState } from "./build-storage";
import { dependencyBlockers } from "./build-planning";

export function saveBuildCompletion(
  vehicleId: string,
  buildId: string,
  itemId: string,
  input: Omit<import("zod").input<typeof buildCompletionSchema>, "updatedAt">,
  storage: Pick<Storage, "getItem" | "setItem">,
  now = new Date().toISOString(),
) {
  const state = readBuildState(storage);
  if (
    !state.builds.some(
      (build) => build.id === buildId && build.vehicleId === vehicleId,
    )
  )
    throw new Error("ownership");
  const item = state.items.find(
    (entry) => entry.id === itemId && entry.buildId === buildId,
  );
  if (!item) throw new Error("missing");
  const completion = buildCompletionSchema.parse({ ...input, updatedAt: now });
  if (completion.completedOn > now.slice(0, 10)) throw new Error("future");
  if (
    dependencyBlockers(
      item,
      state.items.filter((entry) => entry.buildId === buildId),
    ).length
  )
    throw new Error("dependencies");
  const purchase = item.workbench?.purchase;
  if (
    purchase &&
    completion.completedOn < (purchase.deliveredAt ?? purchase.orderedAt)
  )
    throw new Error("purchaseDate");
  if (
    purchase &&
    completion.actualCost !== undefined &&
    completion.actualCost < purchase.amount - purchase.refunded
  )
    throw new Error("purchaseCost");
  const updated = buildItemSchema.parse({
    ...item,
    completion,
    status: "installed",
    updatedAt: now,
  });
  // One atomic write; timeline, expenses and progress derive from this record.
  storage.setItem(
    BUILD_STORAGE_KEY,
    JSON.stringify({
      ...state,
      items: state.items.map((entry) =>
        entry.id === itemId ? updated : entry,
      ),
    }),
  );
  return updated;
}

export function reopenBuildCompletion(
  vehicleId: string,
  buildId: string,
  itemId: string,
  storage: Pick<Storage, "getItem" | "setItem">,
) {
  const state = readBuildState(storage);
  if (
    !state.builds.some(
      (build) => build.id === buildId && build.vehicleId === vehicleId,
    )
  )
    throw new Error("ownership");
  const item = state.items.find(
    (entry) => entry.id === itemId && entry.buildId === buildId,
  );
  if (!item) throw new Error("missing");
  // Reopening removes the installation, not a real purchase. Retain the private
  // draft so corrections/re-completion do not lose photos or add duplicate rows.
  const updated = buildItemSchema.parse({
    ...item,
    status: item.workbench?.purchase ? "ordered" : "planned",
    workbench: item.workbench
      ? {
          ...item.workbench,
          purchase: item.workbench.purchase
            ? {
                ...item.workbench.purchase,
                installedAt: undefined,
                mileage: undefined,
              }
            : undefined,
        }
      : undefined,
    updatedAt: new Date().toISOString(),
  });
  storage.setItem(
    BUILD_STORAGE_KEY,
    JSON.stringify({
      ...state,
      items: state.items.map((entry) =>
        entry.id === itemId ? updated : entry,
      ),
    }),
  );
  return updated;
}

export function storyMilestones(items: BuildItem[]) {
  const complete = items.filter((item) => item.status === "installed");
  const stages = [
    "foundation",
    "handling",
    "appearance",
    "performance",
  ] as const;
  return {
    firstMaintenance: complete.some((item) => item.kind === "maintenance"),
    firstWork: complete.length > 0,
    stages: stages.filter((stage) => {
      const relevant = items.filter((item) => item.stage === stage);
      return (
        relevant.length > 0 &&
        relevant.every((item) => item.status === "installed")
      );
    }),
  };
}

// Deliberately not accepting a Vehicle, task title or note: only aggregate data
// can enter the default share card, even if free text contains private details.
export function shareCardData(items: BuildItem[]) {
  const completed = items.filter((item) => item.status === "installed").length;
  return {
    completed,
    total: items.length,
    progress: items.length ? Math.round((completed / items.length) * 100) : 0,
  };
}
