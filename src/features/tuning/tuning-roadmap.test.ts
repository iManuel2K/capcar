import { describe, expect, it } from "vitest";
import {
  generateTuningPlan,
  tuningGoals,
  tuningAiBrief,
  tuningPlanInputSchema,
} from "./tuning-roadmap";
import {
  TUNING_STORAGE_KEY,
  readTuningPlans,
  saveTuningPlan,
  updateTuningCheck,
} from "./tuning-storage";

const vehicle = {
  id: "private-id",
  make: "BMW",
  productionYear: 2011,
  model: "318i",
  platform: "E90",
  engineCode: "N43",
};
const input = { goal: "power", experience: "beginner", budget: 5003 } as const;
const now = "2026-11-01T10:00:00.000Z";
function storage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe("tuning roadmaps", () => {
  it.each(tuningGoals)(
    "creates a usable %s roadmap with exact budget totals",
    (goal) => {
      for (const reservePercent of [0, 10, 20] as const) {
        const plan = generateTuningPlan(
          vehicle,
          { ...input, goal, reservePercent },
          now,
        );
        expect(plan.stages.map((stage) => stage.id)).toEqual([
          "baseline",
          "safety",
          goal,
          "install",
          "verify",
        ]);
        expect(
          plan.stages.reduce(
            (sum, stage) => sum + stage.budget,
            plan.reserveBudget ?? 0,
          ),
        ).toBe(5003);
        expect(
          plan.stages.every(
            (stage) => stage.checks.length >= 2 && stage.budget >= 0,
          ),
        ).toBe(true);
        expect(plan.stages[3].dependsOn).toEqual([goal]);
        expect(plan.warnings.join(" ")).toContain("No power gain");
      }
    },
  );
  it("uses experience, road use and reliability priority", () => {
    const beginner = generateTuningPlan(vehicle, input, now);
    const experienced = generateTuningPlan(
      vehicle,
      { ...input, experience: "intermediate", usage: "track" },
      now,
    );
    expect(beginner.stages[0].checks).not.toEqual(experienced.stages[0].checks);
    expect(beginner.stages[4].checks).not.toEqual(experienced.stages[4].checks);
    expect(experienced.stages[4].checks.join(" ")).toContain("organiser");
    const reliable = generateTuningPlan(
      vehicle,
      { ...input, goal: "reliability" },
      now,
    );
    expect(reliable.stages[0].budget).toBeGreaterThan(
      beginner.stages[0].budget,
    );
  });
  it.each(["en", "de", "el", "sq", "ja"] as const)(
    "localizes every goal in %s without changing progress keys",
    (locale) => {
      for (const goal of tuningGoals) {
        const plan = generateTuningPlan(
          vehicle,
          { ...input, goal },
          now,
          locale,
        );
        const english = generateTuningPlan(vehicle, { ...input, goal }, now);
        expect(
          plan.stages.map((stage) => [stage.id, stage.checks.length]),
        ).toEqual(
          english.stages.map((stage) => [stage.id, stage.checks.length]),
        );
        for (const stage of plan.stages) {
          expect(stage.title).toBeTruthy();
          expect(stage.reason).toBeTruthy();
          expect(stage.checks.every(Boolean)).toBe(true);
          if (locale !== "en")
            expect(stage.title).not.toBe(english.stages[stage.order - 1].title);
        }
      }
    },
  );
  it("rejects invalid budget and reserve values", () => {
    for (const budget of [0, 499, 500.5, 100001, NaN])
      expect(
        tuningPlanInputSchema.safeParse({ ...input, budget }).success,
      ).toBe(false);
    expect(
      tuningPlanInputSchema.safeParse({ ...input, reservePercent: 90 }).success,
    ).toBe(false);
  });
  it("copies context and progress without internal IDs", () => {
    const plan = generateTuningPlan(vehicle, input, now);
    plan.completedChecks = ["baseline:0"];
    const brief = tuningAiBrief(vehicle, plan, "en");
    expect(brief).toContain("2011 BMW 318i");
    expect(brief).toContain("5003");
    expect(brief).toContain("[x] Record service history");
    expect(brief).not.toContain("private-id");
    expect(brief).toContain("Do not invent");
  });
});

describe("saved tuning progress", () => {
  it("persists settings and progress while preserving other cars", () => {
    const store = storage();
    const plan = generateTuningPlan(vehicle, input, now);
    saveTuningPlan(plan, store);
    saveTuningPlan({ ...plan, vehicleId: "other-car" }, store);
    updateTuningCheck(vehicle.id, now, "baseline", 0, true, store);
    const saved = readTuningPlans(store);
    expect(saved).toHaveLength(2);
    expect(
      saved.find((item) => item.vehicleId === vehicle.id)?.completedChecks,
    ).toEqual(["baseline:0"]);
    expect(
      saved.find((item) => item.vehicleId === vehicle.id)?.reservePercent,
    ).toBe(10);
    expect(
      saved.find((item) => item.vehicleId === "other-car")?.completedChecks,
    ).toEqual([]);
  });
  it("requires earlier checks and reopens dependent work when a prerequisite changes", () => {
    const store = storage();
    const plan = generateTuningPlan(vehicle, input, now);
    saveTuningPlan(plan, store);
    expect(() =>
      updateTuningCheck(vehicle.id, now, "safety", 0, true, store),
    ).toThrow();
    plan.stages[0].checks.forEach((_, index) =>
      updateTuningCheck(vehicle.id, now, "baseline", index, true, store),
    );
    updateTuningCheck(vehicle.id, now, "safety", 0, true, store);
    updateTuningCheck(vehicle.id, now, "baseline", 0, false, store);
    expect(readTuningPlans(store)[0].completedChecks).toEqual([
      "baseline:1",
      "baseline:2",
    ]);
    expect(() =>
      updateTuningCheck(
        vehicle.id,
        "2025-01-01T00:00:00.000Z",
        "baseline",
        0,
        true,
        store,
      ),
    ).toThrow();
    expect(() =>
      updateTuningCheck(vehicle.id, now, "baseline", -1, true, store),
    ).toThrow();
  });
  it("retains legacy plans and valid records alongside malformed entries", () => {
    const store = storage();
    const legacy = {
      vehicleId: "old",
      goal: "handling",
      experience: "beginner",
      budget: 5000,
      generatedAt: now,
      stages: [
        {
          id: "old-check",
          order: 1,
          title: "Existing plan",
          reason: "Keep it",
          budget: 5000,
          checks: ["Existing check"],
        },
      ],
      warnings: [],
    };
    store.setItem(TUNING_STORAGE_KEY, JSON.stringify([null, legacy]));
    expect(readTuningPlans(store)).toEqual([legacy]);
    saveTuningPlan(generateTuningPlan(vehicle, input, now), store);
    expect(readTuningPlans(store)).toHaveLength(2);
  });
  it("handles unreadable storage and surfaces failed writes", () => {
    const store = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("full");
      },
    };
    expect(readTuningPlans(store)).toEqual([]);
    expect(() =>
      saveTuningPlan(generateTuningPlan(vehicle, input, now), store),
    ).toThrow("full");
  });
});
