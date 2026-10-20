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
  it("adds three sourced F-150 records only for the documented identity and year", () => {
    const truck = {
      make: "Ford",
      model: "F-150",
      platform: "P702",
      productionYear: 2021,
      engineCode: "UNKNOWN",
    };
    const records = dailyProblemsForVehicle(truck);
    expect(records.map((record) => record.id)).toEqual([
      "f150-2021-transmission-shift",
      "f150-2021-parking-brake-23s35",
      "f150-2021-wiper-motor-22s12",
    ]);
    expect(
      records.filter((record) => record.evidence === "safety-recall"),
    ).toHaveLength(2);
    expect(records.every((record) => record.requiresVariantConfirmation)).toBe(
      true,
    );
    expect(dailyProblemsForVehicle({ ...truck, model: "F150" })).toHaveLength(
      3,
    );
    for (const patch of [
      { productionYear: 2020 },
      { productionYear: 2022 },
      { platform: "P552" },
      { make: "Toyota" },
      { model: "Ranger" },
    ]) {
      expect(dailyProblemsForVehicle({ ...truck, ...patch })).toHaveLength(0);
    }
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
