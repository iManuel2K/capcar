import {
  buildStages,
  buildPriorities,
  type Build,
  type BuildItem,
} from "./build-schema";

export function getBuildJourney(
  build: Build,
  allItems: BuildItem[],
  visualSaved: boolean,
) {
  const items = allItems.filter((item) => item.buildId === build.id);
  const remaining = items.filter((item) => item.status !== "installed");
  const next = [...remaining].sort(
    (a, b) =>
      buildPriorities.indexOf(a.priority) -
        buildPriorities.indexOf(b.priority) ||
      buildStages.indexOf(a.stage) - buildStages.indexOf(b.stage) ||
      a.createdAt.localeCompare(b.createdAt) ||
      a.id.localeCompare(b.id),
  )[0];
  return {
    next,
    activated: items.some((item) => Boolean(item.selectedOfferId)),
    steps: [
      { label: "Imagine", done: true },
      { label: "Plan", done: items.length > 0 },
      {
        label: "Find",
        done: items.some((item) => Boolean(item.selectedOfferId)),
      },
      { label: "Visualize", done: visualSaved },
      { label: "Build", done: items.length > 0 && remaining.length === 0 },
      {
        label: "Remember",
        done: items.some((item) => item.status === "installed"),
      },
    ],
    stages: buildStages.map((stage) => ({
      stage,
      allocated: items
        .filter((item) => item.stage === stage)
        .reduce((sum, item) => sum + item.estimatedCost, 0),
    })),
  };
}
