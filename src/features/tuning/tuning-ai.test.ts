import { describe, expect, it } from "vitest";
import { generateTuningPlan } from "./tuning-roadmap";
import { tuningAiContext } from "./tuning-ai";
import { copilotRequestSchema } from "@/features/copilot/copilot-schema";
const vehicle = {
  id: "car",
  model: "318i",
  engineCode: "N43",
  platform: "E90",
  productionYear: 2011,
  mileage: 0,
};
describe("tuning context", () => {
  it("carries settings and completed checks across all locales without changing the plan", () => {
    for (const locale of ["en", "de", "el", "sq", "ja"] as const) {
      const plan = generateTuningPlan(
        vehicle,
        {
          goal: "reliability",
          experience: "intermediate",
          usage: "weekend",
          reservePercent: 20,
          budget: 5000,
        },
        undefined,
        locale,
      );
      plan.completedChecks = ["baseline:0"];
      const original = JSON.stringify(plan);
      const context = tuningAiContext(plan, "safety");
      expect(context.reserveBudget).toBe(1000);
      expect(context.selectedStage).toBe("safety");
      expect(context.stages[0].checks[0].done).toBe(true);
      expect(context.stages[0].checks[1].done).toBe(false);
      expect(
        copilotRequestSchema.safeParse({
          intent: "tuning_review",
          tuningContext: context,
          vehicle,
          message: "what next",
          buildItems: [],
        }).success,
      ).toBe(true);
      expect(JSON.stringify(plan)).toBe(original);
      expect(tuningAiContext(plan, "unknown").selectedStage).toBeUndefined();
    }
  });
});
