import { describe, expect, it } from "vitest";
import { readDiagnostics, saveDiagnostic, updateDiagnosticStatus } from "@/features/diagnostics/diagnostic-storage";

describe("diagnostic storage", () => {
  it("normalizes a DTC and retains its resolution", () => {
    localStorage.clear();
    const record = saveDiagnostic({ vehicleId: "vehicle-1", code: "p0420", title: "Catalyst efficiency", severity: "warning", status: "open", symptoms: "Warning lamp after a long drive", mileage: 148200 }, localStorage, { id: "dtc-1", now: "2026-09-07T10:00:00.000Z" });
    updateDiagnosticStatus(record.id, "resolved", "Leak repaired and code did not return.", localStorage, "2026-09-08T10:00:00.000Z");
    expect(readDiagnostics(localStorage)[0]).toMatchObject({ code: "P0420", status: "resolved", resolution: "Leak repaired and code did not return." });
  });
});
