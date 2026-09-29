import type { Build, BuildItem } from "./build-schema";
import {
  buildPlanningSchema,
  type BuildPhase,
  type BuildPlanning,
} from "./build-planning-schema";

const priority = { now: 0, next: 1, later: 2 } as const;

export function dependencyBlockers(item: BuildItem, items: BuildItem[]) {
  const installedIds = new Set(
    items
      .filter((candidate) => candidate.status === "installed")
      .map((candidate) => candidate.id),
  );
  const byId = new Map(items.map((candidate) => [candidate.id, candidate]));
  return (item.dependsOn ?? [])
    .filter((id) => !installedIds.has(id))
    .map((id) => byId.get(id))
    .filter((candidate): candidate is BuildItem => Boolean(candidate));
}

export function hasDependencyCycle(items: BuildItem[]) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(id: string): boolean {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    const item = byId.get(id);
    for (const dependency of item?.dependsOn ?? []) {
      if (byId.has(dependency) && visit(dependency)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }

  return items.some((item) => visit(item.id));
}

function itemForecast(item: BuildItem) {
  const purchase = item.workbench?.purchase;
  if (purchase) return Math.max(0, purchase.amount - purchase.refunded);
  return item.deliveredPrice ?? item.estimatedCost;
}

export function defaultBuildPlanning(build: Build): BuildPlanning {
  void build;
  const phases: BuildPhase[] = [
    { id: "foundation", title: "Foundation", order: 0, budget: 0 },
    { id: "handling", title: "Handling", order: 1, budget: 0 },
    { id: "appearance", title: "Appearance", order: 2, budget: 0 },
    { id: "performance", title: "Performance", order: 3, budget: 0 },
  ];
  return buildPlanningSchema.parse({
    version: 1,
    phases,
    currentPhaseId: phases[0].id,
  });
}

export function planningForBuild(build: Build) {
  return build.planning ?? defaultBuildPlanning(build);
}

export function phaseForItem(item: BuildItem, planning: BuildPlanning) {
  return (
    planning.phases.find((phase) => phase.id === item.phaseId) ??
    planning.phases.find((phase) => phase.id === item.stage) ??
    planning.phases[0]
  );
}

export function getConnectedBuildMetrics(
  build: Build,
  items: BuildItem[],
  planning = planningForBuild(build),
) {
  const relevant = items.filter((item) => item.buildId === build.id);
  const planned = relevant.reduce((sum, item) => sum + item.estimatedCost, 0);
  const committed = relevant.reduce(
    (sum, item) => sum + (item.deliveredPrice ?? 0),
    0,
  );
  const paid = relevant.reduce(
    (sum, item) =>
      sum +
      (item.workbench?.purchase
        ? item.workbench.purchase.amount - item.workbench.purchase.refunded
        : 0),
    0,
  );
  const forecast = relevant.reduce((sum, item) => sum + itemForecast(item), 0);
  const completed = relevant.filter((item) => item.status === "installed");
  const remaining = relevant.filter((item) => item.status !== "installed");
  const orderedPhases = [...planning.phases].sort(
    (left, right) => left.order - right.order,
  );
  const ordered = [...remaining].sort((left, right) => {
    const leftPhase = phaseForItem(left, planning)?.order ?? 99;
    const rightPhase = phaseForItem(right, planning)?.order ?? 99;
    return (
      leftPhase - rightPhase ||
      priority[left.priority] - priority[right.priority] ||
      left.createdAt.localeCompare(right.createdAt)
    );
  });
  const blocked = ordered.filter(
    (item) => dependencyBlockers(item, relevant).length > 0,
  );
  const next = ordered.find(
    (item) => dependencyBlockers(item, relevant).length === 0,
  );
  return {
    planned,
    committed,
    paid,
    forecast,
    remaining: build.budget - forecast,
    progress:
      relevant.length === 0
        ? 0
        : Math.round((completed.length / relevant.length) * 100),
    next,
    blocked,
    phases: orderedPhases.map((phase) => {
      const phaseItems = relevant.filter(
        (item) => phaseForItem(item, planning)?.id === phase.id,
      );
      const phaseForecast = phaseItems.reduce(
        (sum, item) => sum + itemForecast(item),
        0,
      );
      return {
        ...phase,
        planned: phaseItems.reduce((sum, item) => sum + item.estimatedCost, 0),
        committed: phaseItems.reduce(
          (sum, item) => sum + (item.deliveredPrice ?? 0),
          0,
        ),
        paid: phaseItems.reduce(
          (sum, item) =>
            sum +
            (item.workbench?.purchase
              ? item.workbench.purchase.amount -
                item.workbench.purchase.refunded
              : 0),
          0,
        ),
        forecast: phaseForecast,
        remaining: phase.budget - phaseForecast,
        completed: phaseItems.filter((item) => item.status === "installed")
          .length,
        itemCount: phaseItems.length,
      };
    }),
  };
}
