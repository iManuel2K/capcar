import { describe, expect, it } from "vitest";
import {
  dailyCarProblems,
  dailyProblemsForVehicle,
} from "./daily-car-coverage";
import { findGuideBySlug } from "@/features/guides/guide-catalog";
describe("source-scoped daily-car coverage", () => {
  it("requires make, model, generation and year", () => {
    const car = {
      make: "Toyota",
      model: "Auris",
      platform: "E180",
      engineCode: "UNKNOWN",
      productionYear: 2015,
    };
    expect(dailyProblemsForVehicle(car).map((record) => record.id)).toContain(
      "auris-2013-battery",
    );
    for (const patch of [
      { make: "Ford" },
      { model: "Corolla" },
      { platform: "E210" },
      { productionYear: 2026 },
    ])
      expect(dailyProblemsForVehicle({ ...car, ...patch })).toHaveLength(0);
    expect(
      dailyProblemsForVehicle({ platform: "E180", engineCode: "UNKNOWN" }),
    ).toHaveLength(0);
  });
  it("does not apply the small-petrol Golf bulletin to GTI/R showcase cars", () => {
    expect(
      dailyProblemsForVehicle({
        make: "Volkswagen",
        model: "Golf GTI TCR",
        platform: "MK7.5",
        engineCode: "EA888",
        productionYear: 2019,
      }),
    ).toHaveLength(0);
  });
  it("provides five native preparation steps and a source for each new reference", () => {
    for (const problem of dailyCarProblems) {
      const guide = findGuideBySlug(`inspection-${problem.id}`)!;
      expect(guide.purpose).toBe("inspection");
      expect(guide.steps).toHaveLength(5);
      expect(guide.reviewStatus).not.toBe("verified");
      expect(guide.sources[0].url).toBe(problem.sourceUrl);
    }
  });
});
