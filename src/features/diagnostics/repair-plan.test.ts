import { beforeEach, describe, expect, it } from "vitest";
import {
  DIAGNOSTIC_STORAGE_KEY,
  readDiagnostics,
  saveDiagnostic,
  saveRepairPlan,
} from "./diagnostic-storage";
describe("repair plans", () => {
  beforeEach(() => localStorage.clear());
  it("keeps completed checks separate from fault resolution", () => {
    const record = saveDiagnostic(
      {
        vehicleId: "car",
        code: "P0301",
        title: "Misfire",
        severity: "warning",
        symptoms: "Rough idle",
        mileage: 1000,
      },
      localStorage,
    );
    saveRepairPlan(
      record.id,
      [{ label: "Record symptoms", done: true }],
      localStorage,
    );
    expect(readDiagnostics(localStorage)[0].status).toBe("open");
    expect(readDiagnostics(localStorage)[0].repairPlan?.checks[0].done).toBe(
      true,
    );
  });
  it("does not replace malformed stored records", () => {
    localStorage.setItem(DIAGNOSTIC_STORAGE_KEY, "{broken");
    expect(() => saveRepairPlan("missing", [], localStorage)).toThrow();
    expect(localStorage.getItem(DIAGNOSTIC_STORAGE_KEY)).toBe("{broken");
  });
});
