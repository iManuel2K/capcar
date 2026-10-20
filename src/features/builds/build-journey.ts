import type { Build, BuildItem } from "./build-schema";
import { getConnectedBuildMetrics, planningForBuild } from "./build-planning";

export function getBuildJourney(
  build: Build,
  allItems: BuildItem[],
  visualSaved: boolean,
) {
  const items = allItems.filter((item) => item.buildId === build.id);
  const remaining = items.filter((item) => item.status !== "installed");
  const planning = planningForBuild(build);
  const metrics = getConnectedBuildMetrics(build, items, planning);
  const next = metrics.next;
  const offerSaved = items.some((item) => Boolean(item.selectedOfferId));
  const workStarted = items.some(
    (item) => item.status === "ordered" || item.status === "installed",
  );
  // Later work can be recorded without an offer or an optional visual concept.
  const currentStep =
    items.length > 0 && remaining.length === 0
      ? 5
      : workStarted
        ? 4
        : offerSaved
          ? visualSaved
            ? 4
            : 3
          : items.length > 0
            ? 2
            : 1;
  return {
    currentStep,
    next,
    activated: offerSaved,
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
    stages: metrics.phases.map((phase) => ({
      stage: phase.id,
      title: phase.title,
      allocated: phase.forecast,
    })),
    blocked: metrics.blocked,
  };
}
