import { describe, expect, it } from "vitest";
import { readCostState, saveCostEntry, setVehicleBudget, summarizeVehicleCosts } from "@/features/costs/cost-storage";

describe("cost analytics", () => {
  it("compares category totals with a vehicle budget", () => {
    localStorage.clear();
    setVehicleBudget("vehicle-1", 1200, localStorage);
    saveCostEntry({ vehicleId: "vehicle-1", label: "Rear lights", category: "parts", amount: 604, occurredOn: "2026-09-07" }, localStorage, { id: "cost-1", createdAt: "2026-09-07T10:00:00.000Z" });
    saveCostEntry({ vehicleId: "vehicle-1", label: "Alignment", category: "labor", amount: 200, occurredOn: "2026-09-07" }, localStorage, { id: "cost-2", createdAt: "2026-09-07T10:00:00.000Z" });
    const summary = summarizeVehicleCosts("vehicle-1", readCostState(localStorage));
    expect(summary).toMatchObject({ total: 804, budget: 1200, categories: { parts: 604, labor: 200, maintenance: 0 } });
  });
});
