import { describe, expect, it, vi } from "vitest";
import { quoteSchema, workbenchSchema } from "./build-workbench-schema";
import { refreshPriceWatches, togglePriceWatch } from "./price-watch";
import { vehicleSchema } from "@/features/vehicles/vehicle-schema";

vi.stubGlobal("crypto", {
  randomUUID: () => "11111111-1111-4111-8111-111111111111",
});

const now = "2026-09-15T10:00:00.000Z";
const vehicle = vehicleSchema.parse({
  id: "vehicle",
  make: "BMW",
  model: "318i",
  productionYear: 2011,
  platform: "E90",
  engineCode: "N43B20",
  bodyStyle: "Sedan",
  transmission: "Manual",
  mileage: 100_000,
  createdAt: now,
});
const quote = quoteSchema.parse({
  id: "quote",
  retailer: "Owner retailer",
  title: "Rear lamp pair",
  partNumber: "PN123",
  url: "https://parts.example.com/rear-lamps",
  origin: "owner-quote",
  price: 200,
  shipping: 10,
  extraCharges: null,
  tax: 0,
  importCharges: 0,
  otherCharges: 0,
  currency: "EUR",
  condition: "New",
  destination: "DE 65428",
  sellerHistory: "Established seller",
  warranty: "Two years",
  returns: "30 days",
  delivery: "",
  availability: "in-stock",
  observedAt: now,
  affiliate: false,
});

describe("price watches", () => {
  it("records only changed observations and deduplicates unchanged alerts", () => {
    let workbench = togglePriceWatch(
      workbenchSchema.parse({ quotes: [quote] }),
      quote,
      220,
      now,
    );
    const first = refreshPriceWatches(
      workbench,
      vehicle,
      "2011 BMW 318i",
      "/garage/vehicle/builds/build",
      now,
    );
    expect(first.notifications[0].detail).toContain("Target reached");
    expect(first.workbench.watches[0].snapshots).toHaveLength(1);
    workbench = first.workbench;
    const second = refreshPriceWatches(
      workbench,
      vehicle,
      "2011 BMW 318i",
      "/garage/vehicle/builds/build",
      "2026-09-15T11:00:00.000Z",
    );
    expect(second.notifications).toHaveLength(0);
    expect(second.workbench.watches[0].snapshots).toHaveLength(1);
  });
});
