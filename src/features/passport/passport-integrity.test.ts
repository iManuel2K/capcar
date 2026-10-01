import { describe, expect, it } from "vitest";

import {
  createPassportRecordHash,
  passportExpiry,
  verifyPassportRecordHash,
} from "./passport-integrity";
import { vehiclePassportSchema } from "./vehicle-passport";

const passport = vehiclePassportSchema.parse({
  version: 1,
  generatedAt: "2026-09-30T12:00:00.000Z",
  vehicle: {
    id: "vehicle-1",
    make: "BMW",
    model: "318i",
    productionYear: 2011,
    platform: "E90",
    engineCode: "N43B20",
    transmission: "Manual",
    mileage: 148200,
  },
  maintenance: [],
  modifications: [],
  diagnostics: [],
  installStamps: [],
  roadbookVisits: [],
});

describe("public Passport record integrity", () => {
  it("verifies an unchanged snapshot and rejects changed owner-entered data", async () => {
    const hash = await createPassportRecordHash(passport);
    await expect(verifyPassportRecordHash(passport, hash)).resolves.toBe(
      "verified",
    );
    await expect(
      verifyPassportRecordHash(
        { ...passport, vehicle: { ...passport.vehicle, mileage: 148201 } },
        hash,
      ),
    ).resolves.toBe("invalid");
  });

  it("keeps pre-hash links explicitly marked as legacy", async () => {
    await expect(verifyPassportRecordHash(passport, null)).resolves.toBe(
      "legacy",
    );
  });

  it("creates bounded expiry timestamps without forcing permanent links", () => {
    const now = new Date("2026-09-30T12:00:00.000Z");
    expect(passportExpiry(30, now)).toBe("2026-10-30T12:00:00.000Z");
    expect(passportExpiry(null, now)).toBeNull();
  });
});
