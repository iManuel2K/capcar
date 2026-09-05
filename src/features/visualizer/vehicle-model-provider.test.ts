import { describe, expect, it } from "vitest";

import { createVehicleModelProvider } from "@/features/visualizer/vehicle-model-provider";

describe("vehicle model provider", () => {
  it("creates model-ready reference geometry without claiming dimensional verification", async () => {
    const result = await createVehicleModelProvider({}).resolve({
      vehicle: {
        make: "BMW",
        model: "318i",
        productionYear: 2011,
        platform: "E90",
        bodyStyle: "Sedan",
        engineCode: "N43",
        transmission: "Manual",
      },
    });
    expect(result.source).toBe("demo");
    expect(result.accuracy).toBe("concept");
    expect(result.coordinateUnit).toBe("mm");
    expect(result.vertices.length).toBeGreaterThan(20);
    expect(result.license.commercialUse).toBe(false);
  });
});
