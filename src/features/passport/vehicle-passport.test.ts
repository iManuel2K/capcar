import { describe, expect, it } from "vitest";
import { saveDiagnostic } from "@/features/diagnostics/diagnostic-storage";
import { buildVehiclePassport, passportToCsv } from "@/features/passport/vehicle-passport";
import { saveVehicle } from "@/features/vehicles/vehicle-storage";

describe("vehicle passport", () => {
  it("creates an owner-controlled export from linked vehicle records", () => {
    localStorage.clear();
    const vehicle = saveVehicle({ make: "BMW", model: "318i", productionYear: 2011, platform: "E90", bodyStyle: "Sedan", engineCode: "N43", transmission: "Manual", mileage: 148200 }, localStorage, { id: "vehicle-1", createdAt: "2026-09-07T09:00:00.000Z" });
    saveDiagnostic({ vehicleId: vehicle.id, code: "P0420", title: "Catalyst efficiency", severity: "warning", status: "monitoring", symptoms: "Stored after motorway drive", mileage: 148200 }, localStorage, { id: "dtc-1", now: "2026-09-07T10:00:00.000Z" });
    const passport = buildVehiclePassport(vehicle.id, localStorage, "2026-09-07T11:00:00.000Z");
    expect(passport?.diagnostics[0].code).toBe("P0420");
    expect(passportToCsv(passport!)).toContain("diagnostic");
  });
});
