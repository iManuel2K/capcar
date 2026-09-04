import { describe, expect, it } from "vitest";

import { vehicleInputSchema } from "@/features/vehicles/vehicle-schema";

const validVehicle = {
  make: "BMW" as const,
  model: "318i",
  productionYear: "2011",
  platform: "e90",
  bodyStyle: "Sedan" as const,
  engineCode: "n43b20",
  transmission: "Manual" as const,
  mileage: "148200",
  color: "Space Grey",
  nickname: "",
  vin: "",
};

describe("vehicleInputSchema", () => {
  it("normalizes chassis and engine codes", () => {
    const result = vehicleInputSchema.parse(validVehicle);

    expect(result.platform).toBe("E90");
    expect(result.engineCode).toBe("N43B20");
    expect(result.productionYear).toBe(2011);
    expect(result.mileage).toBe(148200);
    expect(result.vin).toBeUndefined();
  });

  it("rejects an invalid VIN", () => {
    const result = vehicleInputSchema.safeParse({
      ...validVehicle,
      vin: "INVALID",
    });

    expect(result.success).toBe(false);
  });
});
