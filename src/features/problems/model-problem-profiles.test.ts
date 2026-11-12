import { describe, expect, it } from "vitest";
import { additionalGarageCars } from "@/features/vehicles/additional-garage-cars";
import { everydayGarageCars } from "@/features/vehicles/everyday-garage-cars";
import {
  garageCarCatalog,
  searchGarageCars,
} from "@/features/vehicles/garage-car-catalog";
import { getProblemProfile } from "./source-profiles";
import {
  modelProblemProfiles,
  modelProblemProfileForVehicle,
} from "./model-problem-profiles";
import { modelProblemCopy } from "./model-problem-copy";
import { locales } from "@/i18n/config";
const vehicle = (id: string, year?: number) => {
  const car = garageCarCatalog.find((entry) => entry.id === id)!;
  return { ...car, productionYear: year ?? car.years[0] };
};
describe("100-car catalogue and sourced model notes", () => {
  it("adds 45 choices with independent model sources and conservative recall policies", () => {
    expect(additionalGarageCars).toHaveLength(45);
    expect(
      garageCarCatalog.filter((car) => car.id !== "nissan-proto"),
    ).toHaveLength(100);
    expect(
      new Set(modelProblemProfiles.map((profile) => profile.carId)).size,
    ).toBe(70);
    for (const car of [...additionalGarageCars, ...everydayGarageCars]) {
      const profile = modelProblemProfileForVehicle(vehicle(car.id));
      expect(profile, car.id).toBeDefined();
      expect(profile?.carId).toBe(car.id);
      expect(new URL(profile!.sourceUrl).hostname).toBe("www.adac.de");
      expect(getProblemProfile(car.id)?.mapping).toEqual({
        models: [],
        reason: "market",
      });
      expect(car.visual).toBe(false);
    }
  });
  it("finds new cars by make, model, generation and interior year without unrelated matches", () => {
    expect(searchGarageCars("2016 A1 audi").map((car) => car.id)).toEqual([
      "audi-a1-8x",
    ]);
    expect(searchGarageCars("VW Passat 2020").map((car) => car.id)).toEqual([
      "passat-b8",
    ]);
    expect(searchGarageCars("Citroën C3").map((car) => car.id)).toEqual([
      "c3-ii",
    ]);
    expect(searchGarageCars("Tesla 2021").map((car) => car.id)).toEqual([
      "tesla-model-3",
    ]);
  });
  it("does not attach reports to the wrong model, generation or year, including reused generation names", () => {
    const car = vehicle("captur-i", 2016);
    for (const patch of [
      { make: "Dacia" },
      { model: "Clio" },
      { platform: "II" },
      { productionYear: 2020 },
    ]) {
      expect(
        modelProblemProfileForVehicle({ ...car, ...patch }),
      ).toBeUndefined();
    }
    expect(
      modelProblemProfileForVehicle({ ...vehicle("c3-ii"), make: "Citroën" })
        ?.carId,
    ).toBe("c3-ii");
    expect(
      modelProblemProfileForVehicle(vehicle("nissan-proto")),
    ).toBeUndefined();
    expect(
      modelProblemProfileForVehicle(vehicle("octavia-iii", 2018)),
    ).toBeUndefined();
    expect(
      modelProblemProfileForVehicle(vehicle("audi-a4-b8", 2016)),
    ).toBeUndefined();
    expect(
      modelProblemProfileForVehicle(vehicle("astra-j", 2018)),
    ).toBeUndefined();
  });
  it("limits registration-year observations and never implies all variants have a fault", () => {
    expect(
      modelProblemProfileForVehicle(vehicle("audi-q5-8r", 2012)),
    ).toMatchObject({
      scope: "petrol",
      issues: [{ topic: "injection", years: [2012] }],
    });
    expect(
      modelProblemProfileForVehicle(vehicle("audi-q5-8r", 2013))?.issues,
    ).toEqual([]);
    expect(
      modelProblemProfileForVehicle(vehicle("b-class-w246", 2011))?.issues,
    ).toHaveLength(1);
    expect(
      modelProblemProfileForVehicle(vehicle("b-class-w246", 2014))?.issues,
    ).toEqual([]);
    expect(
      modelProblemProfileForVehicle(vehicle("a-class-w176", 2014))?.issues,
    ).toEqual([]);
    expect(
      modelProblemProfileForVehicle(vehicle("tesla-model-3", 2021)),
    ).toMatchObject({
      scope: "electric",
      issues: [{ topic: "brakes" }, { topic: "lights" }],
    });
  });
  it("provides every used topic and all interface text in all five languages", () => {
    const topics = new Set(
      modelProblemProfiles.flatMap((profile) =>
        profile.issues.map((issue) => issue.topic),
      ),
    );
    for (const locale of locales) {
      const copy = modelProblemCopy[locale];
      expect(Object.keys(copy).sort()).toEqual(
        Object.keys(modelProblemCopy.en).sort(),
      );
      for (const topic of topics) {
        expect(Object.keys(copy.topics[topic]).sort()).toEqual([
          "check",
          "help",
          "notice",
          "title",
        ]);
        for (const value of Object.values(copy.topics[topic]))
          expect(value.trim().length).toBeGreaterThan(2);
        if (locale !== "en")
          expect(copy.topics[topic].title).not.toBe(
            modelProblemCopy.en.topics[topic].title,
          );
      }
    }
  });
});
