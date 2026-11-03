import { beforeEach, describe, expect, it } from "vitest";
import {
  garageCarCatalog,
  garageCarCoverage,
  searchGarageCars,
} from "@/features/vehicles/garage-car-catalog";
import { saveVehicle, readVehicles } from "@/features/vehicles/vehicle-storage";
import {
  emptyOnboardingDraft,
  onboardingVehicleInput,
} from "@/features/onboarding/onboarding";
import {
  readBuildState,
  BUILD_STORAGE_KEY,
} from "@/features/builds/build-storage";
import { locales } from "@/i18n/config";
import { commonChecksForVehicle } from "./common-checks";
import { commonCheckCopy } from "./common-check-copy";
import { saveCommonCheck } from "./common-check-plan";
import { findProblemProfile } from "./source-profiles";

beforeEach(() => localStorage.clear());
function car(id = "astra-j") {
  const choice = garageCarCatalog.find((entry) => entry.id === id)!;
  return saveVehicle(
    onboardingVehicleInput({
      ...emptyOnboardingDraft(),
      make: choice.make,
      model: choice.model,
      platform: choice.platform,
      productionYear: String(choice.years[0]),
    }),
    localStorage,
  );
}

describe("expanded garage and common checks", () => {
  it("lets every production choice save through real onboarding validation with useful checks and a matching source policy", () => {
    const production = garageCarCatalog.filter(
      (entry) => entry.id !== "nissan-proto",
    );
    expect(production.length).toBeGreaterThanOrEqual(100);
    expect(new Set(garageCarCatalog.map((entry) => entry.id)).size).toBe(
      garageCarCatalog.length,
    );
    for (const choice of production) {
      const vehicle = car(choice.id);
      expect(vehicle.engineCode).toBe("UNKNOWN");
      expect(commonChecksForVehicle(vehicle)).toHaveLength(4);
      expect(garageCarCoverage(vehicle).checks).toBe(4);
      expect(findProblemProfile(vehicle)?.id).toBe(choice.id);
    }
    expect(readVehicles(localStorage)).toHaveLength(production.length);
    expect(commonChecksForVehicle(car("nissan-proto"))).toEqual([]);
    expect(() =>
      saveCommonCheck(car("nissan-proto").id, "tyres", "en", localStorage),
    ).toThrow();
  });
  it("finds a model by unordered words, accented make/model, alias or an interior production year", () => {
    expect(searchGarageCars("2017 A3 audi").map((entry) => entry.id)).toEqual([
      "audi-a3-8v",
    ]);
    expect(searchGarageCars("VW polo 2012").map((entry) => entry.id)).toEqual([
      "polo-6r",
    ]);
    expect(searchGarageCars("Škoda Octavia").map((entry) => entry.id)).toEqual([
      "octavia-iii",
    ]);
    expect(searchGarageCars("Mégane 2011").map((entry) => entry.id)).toEqual([
      "megane-iii",
    ]);
    expect(searchGarageCars("A3 1990")).toEqual([]);
    expect(searchGarageCars("  ")).toHaveLength(garageCarCatalog.length);
  });
  it("has complete translated steps, tools and stop conditions for every check in each language", () => {
    const vehicle = car();
    for (const locale of locales) {
      const c = commonCheckCopy[locale];
      expect(Object.keys(c).sort()).toEqual(
        Object.keys(commonCheckCopy.en).sort(),
      );
      for (const check of commonChecksForVehicle(vehicle)) {
        const copy = c.checks[check.id];
        expect(copy.steps).toHaveLength(3);
        for (const text of [
          copy.title,
          copy.symptom,
          copy.tools,
          copy.stop,
          ...copy.steps,
        ])
          expect(text.trim().length).toBeGreaterThan(5);
        if (locale !== "en")
          expect(copy.title).not.toBe(
            commonCheckCopy.en.checks[check.id].title,
          );
      }
    }
  });
  it("saves all languages as planned, unpriced tasks; survives reopening and deduplicates locale changes", () => {
    for (const locale of locales) {
      const vehicle = car();
      const first = saveCommonCheck(vehicle.id, "tyres", locale, localStorage);
      const repeat = saveCommonCheck(vehicle.id, "tyres", "de", localStorage);
      expect(first.created).toBe(true);
      expect(repeat).toMatchObject({
        created: false,
        build: { id: first.build.id, vehicleId: vehicle.id },
      });
      const second = saveCommonCheck(
        vehicle.id,
        "wipers",
        locale,
        localStorage,
      );
      expect(second.build.id).toBe(first.build.id);
      const state = readBuildState(localStorage);
      expect(
        state.items.filter((item) => item.buildId === first.build.id),
      ).toHaveLength(2);
      for (const item of state.items)
        expect(item).toMatchObject({
          kind: "maintenance",
          status: "planned",
          estimatedCostKnown: false,
        });
      expect(
        state.items.find((item) => item.buildId === first.build.id)?.note,
      ).toBe(commonCheckCopy[locale].checks.tyres.symptom);
    }
    expect(readBuildState(localStorage).builds).toHaveLength(5);
  });
  it("does not create work for a missing vehicle or leave a partial plan when storage fails", () => {
    const vehicle = car();
    expect(() =>
      saveCommonCheck("another-account-car", "tyres", "en", localStorage),
    ).toThrow();
    const storage = {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(() => saveCommonCheck(vehicle.id, "lights", "en", storage)).toThrow(
      "quota",
    );
    expect(localStorage.getItem(BUILD_STORAGE_KEY)).toBeNull();
    saveCommonCheck(vehicle.id, "lights", "en", localStorage);
    expect(readBuildState(localStorage).items).toHaveLength(1);
  });
});
