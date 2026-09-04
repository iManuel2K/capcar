import { describe, expect, it } from "vitest";

import { evaluateFitment } from "@/features/parts/fitment";
import { findCatalogPart } from "@/features/parts/part-catalog";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

const vehicle: Vehicle = {
  id: "vehicle-1",
  make: "BMW",
  model: "318i",
  productionYear: 2011,
  platform: "E90",
  bodyStyle: "Sedan",
  engineCode: "N43B20",
  transmission: "Manual",
  mileage: 148200,
  color: "Space Grey",
  nickname: "Project 318",
  createdAt: "2026-09-04T10:00:00.000Z",
};

describe("fitment evidence", () => {
  it("matches a structured platform, year and engine rule", () => {
    const part = findCatalogPart("demo-n43-service-kit");
    expect(part && evaluateFitment(part, vehicle).status).toBe("match");
  });

  it("keeps unresolved requirements conditional", () => {
    const part = findCatalogPart("demo-dark-rear-lamps-e90");
    const result = part && evaluateFitment(part, vehicle);
    expect(result?.status).toBe("conditional");
    expect(result?.conditions).toContain("Road approval is not verified");
  });

  it("rejects a different platform", () => {
    const part = findCatalogPart("demo-g20-splitter");
    expect(part && evaluateFitment(part, vehicle).status).toBe("mismatch");
  });
});
