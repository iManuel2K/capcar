import { describe, expect, it } from "vitest";
import {
  readCostState,
  saveCostEntry,
  setVehicleBudget,
  summarizeVehicleCosts,
  updateCostEntry,
  deleteCostEntry,
  exportVehicleCostsCsv,
} from "@/features/costs/cost-storage";

describe("cost analytics", () => {
  it("corrects a recorded expense without duplicating it or changing another vehicle", () => {
    localStorage.clear();
    const input = {
      vehicleId: "car-a",
      label: "Alignment",
      category: "labor" as const,
      amount: 120,
      occurredOn: "2026-09-10",
    };
    const original = saveCostEntry(input, localStorage);
    const other = saveCostEntry({ ...input, vehicleId: "car-b" }, localStorage);
    expect(() =>
      updateCostEntry(
        original.id,
        { ...input, vehicleId: "car-b" },
        localStorage,
      ),
    ).toThrow();
    updateCostEntry(
      original.id,
      { ...input, amount: 180, note: "Corrected invoice" },
      localStorage,
    );
    const state = readCostState(localStorage);
    expect(state.entries).toHaveLength(2);
    expect(state.entries.find((item) => item.id === original.id)).toMatchObject(
      { amount: 180, createdAt: original.createdAt },
    );
    expect(state.entries.find((item) => item.id === other.id)).toEqual(other);
    deleteCostEntry(original.id, "car-b", localStorage);
    expect(readCostState(localStorage).entries).toHaveLength(2);
    deleteCostEntry(original.id, "car-a", localStorage);
    expect(readCostState(localStorage).entries).toEqual([other]);
  });
  it("exports only the selected car and neutralizes spreadsheet formulas", () => {
    localStorage.clear();
    saveCostEntry(
      {
        vehicleId: "a",
        label: '=HYPERLINK("bad")',
        category: "parts",
        amount: 10.5,
        occurredOn: "2026-09-10",
        note: "line one\nline two",
      },
      localStorage,
    );
    saveCostEntry(
      {
        vehicleId: "b",
        label: "Private other car",
        category: "parts",
        amount: 50,
        occurredOn: "2026-09-10",
      },
      localStorage,
    );
    const csv = exportVehicleCostsCsv("a", readCostState(localStorage));
    expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
    expect(csv).toContain('"10.50"');
    expect(csv).not.toContain("Private other car");
  });
  it("surfaces a failed storage write without reporting a saved edit", () => {
    localStorage.clear();
    const input = {
      vehicleId: "a",
      label: "Service",
      category: "maintenance" as const,
      amount: 20,
      occurredOn: "2026-09-10",
    };
    const entry = saveCostEntry(input, localStorage);
    const unavailable = {
      getItem: localStorage.getItem.bind(localStorage),
      setItem: () => {
        throw new Error("Quota exceeded");
      },
    };
    expect(() =>
      updateCostEntry(entry.id, { ...input, amount: 200 }, unavailable),
    ).toThrow("Quota exceeded");
    expect(readCostState(localStorage).entries[0].amount).toBe(20);
  });
  it("compares category totals with a vehicle budget", () => {
    localStorage.clear();
    setVehicleBudget("vehicle-1", 1200, localStorage);
    saveCostEntry(
      {
        vehicleId: "vehicle-1",
        label: "Rear lights",
        category: "parts",
        amount: 604,
        occurredOn: "2026-09-07",
      },
      localStorage,
      { id: "cost-1", createdAt: "2026-09-07T10:00:00.000Z" },
    );
    saveCostEntry(
      {
        vehicleId: "vehicle-1",
        label: "Alignment",
        category: "labor",
        amount: 200,
        occurredOn: "2026-09-07",
      },
      localStorage,
      { id: "cost-2", createdAt: "2026-09-07T10:00:00.000Z" },
    );
    const summary = summarizeVehicleCosts(
      "vehicle-1",
      readCostState(localStorage),
    );
    expect(summary).toMatchObject({
      total: 804,
      budget: 1200,
      categories: { parts: 604, labor: 200, maintenance: 0 },
    });
  });
});
