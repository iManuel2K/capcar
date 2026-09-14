import { describe, expect, it, vi } from "vitest";
import { getBuildJourney } from "./build-journey";
import {
  createBuildItem,
  createStarterBuild,
  readBuildState,
  updateBuildItemStatus,
} from "./build-storage";
import {
  buildVisualSchema,
  createDefaultBuildVisual,
} from "@/features/visualizer/build-visual-schema";
const input = {
  vehicleId: "car",
  name: "OEM Plus",
  description: "A considered daily build.",
  goal: "OEM+ daily" as const,
  budget: 2000,
};
const first = {
  title: "Rear lights",
  stage: "appearance" as const,
  priority: "now" as const,
  estimatedCost: 300,
};
function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value);
    }),
  };
}
describe("connected build journey", () => {
  it("creates a plan and first modification in one storage write", () => {
    const storage = memory();
    const build = createStarterBuild(input, first, storage);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(readBuildState(storage).items[0].buildId).toBe(build.id);
  });
  it("validates the entire starter before writing", () => {
    const storage = memory();
    expect(() =>
      createStarterBuild(input, { ...first, title: "" }, storage),
    ).toThrow();
    expect(storage.setItem).not.toHaveBeenCalled();
  });
  it("does not hide a failed save", () => {
    expect(() =>
      createStarterBuild(input, first, {
        getItem: () => null,
        setItem: () => {
          throw new Error("quota");
        },
      }),
    ).toThrow("quota");
  });
  it("scopes progress and phase budgets to the selected build", () => {
    const storage = memory();
    const build = createStarterBuild(input, first, storage);
    const other = createStarterBuild(
      { ...input, vehicleId: "other" },
      first,
      storage,
    );
    createBuildItem(
      { ...first, buildId: other.id, status: "installed", estimatedCost: 999 },
      storage,
    );
    const journey = getBuildJourney(
      build,
      readBuildState(storage).items,
      false,
    );
    expect(
      journey.stages.find((stage) => stage.stage === "appearance")?.allocated,
    ).toBe(300);
    expect(journey.steps.find((step) => step.label === "Remember")?.done).toBe(
      false,
    );
    expect(journey.activated).toBe(false);
  });
  it("prioritizes foundation at equal priority without mutating records", () => {
    const storage = memory();
    const build = createStarterBuild(input, first, storage);
    createBuildItem(
      {
        ...first,
        title: "Baseline inspection",
        stage: "foundation",
        buildId: build.id,
      },
      storage,
    );
    const state = readBuildState(storage);
    const before = JSON.stringify(state.items);
    expect(getBuildJourney(build, state.items, false).next?.title).toBe(
      "Baseline inspection",
    );
    expect(JSON.stringify(state.items)).toBe(before);
  });
  it("excludes installed work from the next task and timestamps updates", () => {
    const storage = memory();
    const build = createStarterBuild(input, first, storage);
    const item = readBuildState(storage).items[0];
    updateBuildItemStatus(item.id, "installed", storage);
    const state = readBuildState(storage);
    expect(state.items[0].updatedAt).toBeTruthy();
    expect(getBuildJourney(build, state.items, true).next).toBeUndefined();
    expect(
      getBuildJourney(build, state.items, true).steps.find(
        (step) => step.label === "Build",
      )?.done,
    ).toBe(true);
  });
  it("empty builds are not completed", () => {
    const storage = memory();
    const build = createStarterBuild(input, first, storage);
    expect(
      getBuildJourney(build, [], false).steps.find(
        (step) => step.label === "Build",
      )?.done,
    ).toBe(false);
  });
  it("preserves a validated 3D reference in synced visual data", () => {
    const visual = buildVisualSchema.parse({
      ...createDefaultBuildVisual("car", "build"),
      reference: {
        modelUid: "683639e5ce0c477b882ed6311656d29d",
        paints: { body: "#123456" },
        camera: { position: [1, 2, 3], target: [0, 0, 0] },
      },
    });
    expect(visual.reference?.paints.body).toBe("#123456");
    expect(
      buildVisualSchema.safeParse({
        ...visual,
        reference: { ...visual.reference, paints: { body: "javascript:bad" } },
      }).success,
    ).toBe(false);
  });
});
