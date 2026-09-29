import { describe, expect, it } from "vitest";

import {
  evaluateRetailVehicleMatch,
  retailRequestSchema,
  type RetailApplicability,
} from "./retail-contracts";

const vehicle = {
  make: "BMW",
  model: "318i",
  productionYear: 2011,
  platform: "E90",
  bodyStyle: "Sedan" as const,
  engineCode: "N43B20",
  transmission: "Manual" as const,
};

const applicability: RetailApplicability = {
  make: "BMW",
  platforms: ["E90"],
  engineCodes: ["N43B20"],
  yearFrom: 2009,
  yearTo: 2011,
  bodyStyles: ["Sedan"],
};

describe("structured retailer vehicle matching", () => {
  it("requires every supplied vehicle axis for an exact match", () => {
    expect(evaluateRetailVehicleMatch(vehicle, applicability)).toMatchObject({
      status: "exact",
      matchedAxes: [
        "make",
        "platform",
        "engine",
        "production year",
        "body style",
      ],
      mismatchedAxes: [],
      source: "structured",
    });
  });

  it("reports the exact mismatched axes without using listing text", () => {
    expect(
      evaluateRetailVehicleMatch(vehicle, {
        ...applicability,
        engineCodes: ["N47D20"],
        bodyStyles: ["Touring"],
      }),
    ).toMatchObject({
      status: "mismatch",
      mismatchedAxes: ["engine", "body style"],
    });
  });

  it("keeps offers unverified when a retailer provides no structured scope", () => {
    expect(evaluateRetailVehicleMatch(vehicle)).toMatchObject({
      status: "unverified",
      source: "none",
    });
  });

  it("carries the vehicle profile through a validated retailer request", () => {
    expect(
      retailRequestSchema.parse({
        query: "BMW E90 rear lights",
        market: "DE",
        destination: "DE",
        vehicle,
      }).vehicle,
    ).toEqual(vehicle);
  });
});
