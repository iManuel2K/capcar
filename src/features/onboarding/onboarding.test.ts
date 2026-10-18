import { beforeEach, describe, expect, it } from "vitest";
import {
  draftKey,
  emptyOnboardingDraft,
  onboardingVehicleInput,
  readOnboardingDraft,
  readOnboarding,
  saveOnboarding,
} from "./onboarding";
import { readVehicles, saveVehicle } from "@/features/vehicles/vehicle-storage";
import { readBuildState } from "@/features/builds/build-storage";
import {
  collectLocalSnapshot,
  applyLocalSnapshot,
  clearLocalSnapshot,
} from "@/features/sync/local-snapshot";
import { garageCopy } from "./copy";
import {
  garageCarCatalog,
  garageCarCoverage,
} from "@/features/vehicles/garage-car-catalog";
const labels = {
  name: "My first car plan",
  description: "Owner-created initial plan, not a verified service record.",
};
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
function draft() {
  return {
    ...emptyOnboardingDraft(),
    make: "Mazda",
    model: "3",
    productionYear: "2015",
    platform: "BM",
    goal: "maintain" as const,
    title: "Plan an oil service",
  };
}
describe("personalized garage onboarding", () => {
  it("asks only for make, model and year, preserving unknowns instead of inventing a mechanical specification", () => {
    expect(onboardingVehicleInput(draft())).toMatchObject({
      engineCode: "UNKNOWN",
      bodyStyle: "Unknown",
      transmission: "Unknown",
      mileage: 0,
      mileageKnown: false,
    });
  });
  it.each(["maintain", "modify", "drives"] as const)(
    "saves a useful %s action and remains idempotent on retry",
    (goal) => {
      const input = { ...draft(), goal };
      const first = saveOnboarding(input, localStorage, labels);
      const again = saveOnboarding(input, localStorage, labels);
      expect(first.newlyActivated).toBe(true);
      expect(again.newlyActivated).toBe(false);
      expect(readVehicles(localStorage)).toHaveLength(1);
      expect(readOnboarding(localStorage)).toHaveLength(1);
      const state = readBuildState(localStorage);
      expect(state.builds).toHaveLength(goal === "drives" ? 0 : 1);
      expect(state.items).toHaveLength(goal === "drives" ? 0 : 1);
      if (goal === "drives") expect(first.record.driveIdea).toBe(input.title);
      else
        expect(state.items[0]).toMatchObject({
          status: "planned",
          kind: goal === "maintain" ? "maintenance" : "modification",
        });
    },
  );
  it("does not mark skipping as activation or add an artificial completed service", () => {
    const result = saveOnboarding(
      { ...draft(), skipAction: true },
      localStorage,
      labels,
    );
    expect(result.newlyActivated).toBe(false);
    expect(result.record.activatedAt).toBeUndefined();
    expect(readBuildState(localStorage).items).toHaveLength(0);
  });
  it("reuses an existing vehicle without overwriting its identity, VIN, mileage or photo", () => {
    const original = saveVehicle(
      {
        ...onboardingVehicleInput(draft()),
        mileage: 75000,
        vin: "WBA12345678901234",
        photoDataUrl: "data:image/jpeg;base64,/9j/AA==",
      },
      localStorage,
    );
    const result = saveOnboarding(
      { ...draft(), existingVehicleId: original.id, goal: "modify" },
      localStorage,
      labels,
    );
    expect(result.vehicle).toMatchObject({
      id: original.id,
      mileage: 75000,
      vin: original.vin,
      photoDataUrl: original.photoDataUrl,
      garageGoal: "modify",
    });
    expect(readVehicles(localStorage)).toHaveLength(1);
  });
  it("keeps account drafts separate, expires abandoned drafts, and excludes them from cloud snapshots", () => {
    const input = draft();
    sessionStorage.setItem(draftKey("one"), JSON.stringify(input));
    expect(readOnboardingDraft(sessionStorage, "one")?.make).toBe("Mazda");
    expect(readOnboardingDraft(sessionStorage, "two")).toBeUndefined();
    expect(
      readOnboardingDraft(
        sessionStorage,
        "one",
        input.startedAt + 8 * 86400000,
      ),
    ).toBeUndefined();
    expect(JSON.stringify(collectLocalSnapshot(localStorage))).not.toContain(
      input.id,
    );
  });
  it("syncs saved goals and drive ideas through the existing account snapshot", () => {
    const result = saveOnboarding(
      { ...draft(), goal: "drives" },
      localStorage,
      labels,
    );
    const snapshot = collectLocalSnapshot(localStorage);
    clearLocalSnapshot(localStorage);
    applyLocalSnapshot(snapshot, localStorage);
    expect(readOnboarding(localStorage)[0].vehicleId).toBe(result.vehicle.id);
  });
  it("can retry after quota failure without duplicating the car or its initial task", () => {
    let writes = 0;
    const storage = {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => {
        if (++writes === 3) throw new Error("quota");
        localStorage.setItem(key, value);
      },
    };
    const input = draft();
    expect(() => saveOnboarding(input, storage, labels)).toThrow("quota");
    saveOnboarding(input, storage, labels);
    expect(readVehicles(storage)).toHaveLength(1);
    expect(readBuildState(storage).items).toHaveLength(1);
  });
  it("offers the existing 25 visual models plus cars with published research, without faking coverage", () => {
    expect(garageCarCatalog.length).toBeGreaterThanOrEqual(31);
    expect(
      garageCarCoverage({
        ...onboardingVehicleInput(draft()),
        id: "car",
        createdAt: new Date().toISOString(),
      }).problems,
    ).toBe(1);
    expect(
      garageCarCoverage({
        ...onboardingVehicleInput(draft()),
        make: "Other",
        model: "Other",
        platform: "UNKNOWN",
        id: "car",
        createdAt: new Date().toISOString(),
      }),
    ).toEqual({ parts: 0, problems: 0 });
  });
  it("has complete copy for all five supported languages", () => {
    for (const copy of Object.values(garageCopy))
      expect(Object.keys(copy).sort()).toEqual(
        Object.keys(garageCopy.en).sort(),
      );
    for (const [locale, copy] of Object.entries(garageCopy))
      if (locale !== "en") expect(copy.title).not.toBe(garageCopy.en.title);
  });
});
