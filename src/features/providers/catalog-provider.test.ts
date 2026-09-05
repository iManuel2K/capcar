import { describe, expect, it } from "vitest";

import { createCatalogProvider } from "@/features/providers/catalog-provider";
import type { VehicleDataRequest } from "@/features/providers/provider-contracts";

const vehicle = {
  make: "BMW" as const,
  model: "318i",
  productionYear: 2011,
  platform: "E90",
  bodyStyle: "Sedan",
  engineCode: "N43",
  transmission: "Manual",
} satisfies VehicleDataRequest;

describe("catalog provider", () => {
  it("searches normalized demo parts with vehicle fitment", async () => {
    const result = await createCatalogProvider({}).search({
      vehicle,
      query: "rear lamp",
      category: "Lighting",
    });
    expect(result.source).toBe("demo");
    expect(result.results).toHaveLength(1);
    expect(result.results[0].part.id).toBe("demo-dark-rear-lamps-e90");
    expect(result.results[0].fitment.status).toBe("conditional");
  });
});
