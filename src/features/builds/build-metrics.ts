import type { Build, BuildItem } from "@/features/builds/build-schema";

export function getBuildMetrics(build: Build, items: BuildItem[]) {
  const plannedTotal = items.reduce(
    (total, item) => total + item.estimatedCost,
    0,
  );
  const installedSpend = items
    .filter((item) => item.status === "installed")
    .reduce((total, item) => total + item.estimatedCost, 0);
  const installedCount = items.filter(
    (item) => item.status === "installed",
  ).length;
  return {
    plannedTotal,
    installedSpend,
    remainingBudget: build.budget - plannedTotal,
    progress:
      items.length === 0
        ? 0
        : Math.round((installedCount / items.length) * 100),
  };
}
