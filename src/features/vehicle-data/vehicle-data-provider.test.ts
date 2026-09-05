import { describe, expect, it } from "vitest";

import { createVehicleDataProvider } from "@/features/vehicle-data/vehicle-data-provider";

describe("vehicle data provider", () => {
  it("resolves browser profile data without claiming VIN verification", async () => {
    const provider = createVehicleDataProvider({});
    const result = await provider.resolve({
      make: "BMW",
      model: "318i",
      productionYear: 2011,
      platform: "e90",
      bodyStyle: "Sedan",
      engineCode: "n43",
      transmission: "Manual",
    });
    expect(result.source).toBe("demo");
    expect(result.confidence).toBe("provided");
    expect(result.identity.platform).toBe("E90");
    expect(result.bmwIdentity.vinStatus).toBe("missing");
    expect(result.fieldSources.every((field) => !field.verified)).toBe(true);
    expect(result.warnings.join(" ")).toContain("not a BMW VIN decode");
  });
});
