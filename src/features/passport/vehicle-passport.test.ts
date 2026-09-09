import { describe, expect, it } from "vitest";
import { saveDiagnostic } from "@/features/diagnostics/diagnostic-storage";
import {
  buildVehiclePassport,
  passportToCsv,
  savePassportProfile,
  vehiclePassportSchema,
} from "@/features/passport/vehicle-passport";
import { saveVehicle } from "@/features/vehicles/vehicle-storage";

describe("vehicle passport", () => {
  it("rejects malformed public passport payloads", () => {
    expect(
      vehiclePassportSchema.safeParse({ version: 1, generatedAt: "invalid" })
        .success,
    ).toBe(false);
  });
  it("creates an owner-controlled export from linked vehicle records", () => {
    localStorage.clear();
    const vehicle = saveVehicle(
      {
        make: "BMW",
        model: "318i",
        productionYear: 2011,
        platform: "E90",
        bodyStyle: "Sedan",
        engineCode: "N43",
        transmission: "Manual",
        mileage: 148200,
        vin: "WBAVA71040VA12345",
        imageUrl: "/capcar-bmw-current-side.webp",
      },
      localStorage,
      { id: "vehicle-1", createdAt: "2026-09-07T09:00:00.000Z" },
    );
    saveDiagnostic(
      {
        vehicleId: vehicle.id,
        code: "P0420",
        title: "Catalyst efficiency",
        severity: "warning",
        status: "monitoring",
        symptoms: "Stored after motorway drive",
        mileage: 148200,
      },
      localStorage,
      { id: "dtc-1", now: "2026-09-07T10:00:00.000Z" },
    );
    savePassportProfile(
      {
        vehicleId: vehicle.id,
        ownerName: "Test Owner",
        ownerAddress: "Test Street 1",
        ownerPhone: "+49 123",
        nextInspectionDate: "2027-05-01",
        insuranceCompany: "Example Insurance",
        insurancePolicyNumber: "POL-1",
        publishOwnerDetails: true,
        includeFullVin: false,
      },
      localStorage,
    );
    const passport = buildVehiclePassport(
      vehicle.id,
      localStorage,
      "2026-09-07T11:00:00.000Z",
    );
    expect(passport?.diagnostics[0].code).toBe("P0420");
    expect(passport?.owner?.name).toBe("Test Owner");
    expect(passport?.vehicle.vin).toBeUndefined();
    expect(passport?.vehicle.vinLastFive).toBe("12345");
    expect(passport?.official?.nextInspectionDate).toBe("2027-05-01");
    expect(passportToCsv(passport!)).toContain("diagnostic");
  });

  it("does not expose owner details without explicit consent", () => {
    localStorage.clear();
    const vehicle = saveVehicle(
      {
        make: "BMW",
        model: "318i",
        productionYear: 2011,
        platform: "E90",
        bodyStyle: "Sedan",
        engineCode: "N43",
        transmission: "Manual",
        mileage: 1,
      },
      localStorage,
      { id: "private-car", createdAt: "2026-09-07T09:00:00.000Z" },
    );
    savePassportProfile(
      {
        vehicleId: vehicle.id,
        ownerName: "Private Owner",
        ownerAddress: "Private address",
        ownerPhone: "+49 000",
        publishOwnerDetails: false,
        includeFullVin: false,
      },
      localStorage,
    );
    expect(
      buildVehiclePassport(vehicle.id, localStorage)?.owner,
    ).toBeUndefined();
  });
});
