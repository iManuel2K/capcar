import { describe, expect, it } from "vitest";

import { generateTuningPlan } from "@/features/tuning/tuning-roadmap";

describe("beginner tuning roadmap", () => {
  it("always starts with maintenance and safety", () => {
    const plan = generateTuningPlan(
      { id: "v1", model: "318i", platform: "E90", engineCode: "N43" },
      { goal: "power", experience: "beginner", budget: 5000 },
      "2026-09-05T10:00:00.000Z",
    );
    expect(plan.stages[0].id).toBe("baseline");
    expect(plan.stages[1].id).toBe("safety");
    expect(plan.stages.reduce((sum, stage) => sum + stage.budget, 0)).toBe(
      5000,
    );
    expect(plan.warnings.join(" ")).toContain("No power gain");
  });
});
