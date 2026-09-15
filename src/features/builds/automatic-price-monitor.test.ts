import { describe, expect, it, vi } from "vitest";

import { runAutomaticPriceChecks } from "./automatic-price-monitor";
import { BUILD_STORAGE_KEY } from "./build-storage";
import { VEHICLE_STORAGE_KEY } from "@/features/vehicles/vehicle-storage";

describe("automatic price monitoring", () => {
  it("refreshes an exact due offer and creates one price-drop notification", async () => {
    const storage = localStorage;
    const vehicle = {
      id: "vehicle-1",
      make: "BMW",
      model: "318i",
      productionYear: 2011,
      platform: "E90",
      bodyStyle: "Sedan",
      engineCode: "N43B20",
      transmission: "Manual",
      mileage: 120000,
      createdAt: "2026-09-01T00:00:00.000Z",
    };
    storage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify([vehicle]));
    storage.setItem(
      BUILD_STORAGE_KEY,
      JSON.stringify({
        builds: [
          {
            id: "build-1",
            vehicleId: vehicle.id,
            name: "OEM+ build",
            goal: "OEM+ daily",
            description: "A measured daily-driver build.",
            budget: 3000,
            status: "planning",
            createdAt: "2026-09-01T00:00:00.000Z",
          },
        ],
        items: [
          {
            id: "item-1",
            buildId: "build-1",
            title: "Rear lights",
            stage: "appearance",
            priority: "now",
            estimatedCost: 300,
            status: "planned",
            createdAt: "2026-09-01T00:00:00.000Z",
            workbench: {
              quotes: [quote(250)],
              watches: [
                {
                  id: "00000000-0000-4000-8000-000000000001",
                  quoteId: "ebay:offer-1",
                  query: "BMW E90 rear lights",
                  partNumber: "63217252093",
                  destination: "DE",
                  market: "DE",
                  targetPrice: 220,
                  createdAt: "2026-09-01T00:00:00.000Z",
                  nextCheckAt: "2026-09-15T00:00:00.000Z",
                  snapshots: [snapshot(250)],
                },
              ],
            },
          },
        ],
      }),
    );
    const request = vi.fn().mockResolvedValue({
      source: "ebay",
      checkedAt: "2026-09-15T12:00:00.000Z",
      hasMore: false,
      warning: "Confirm fitment",
      items: [
        {
          id: "offer-1",
          providerItemId: "offer-1",
          provider: "ebay",
          retailer: "eBay",
          title: "BMW E90 rear lights",
          price: 200,
          shipping: 10,
          currency: "EUR",
          country: "DE",
          condition: "Used",
          url: "https://www.ebay.de/itm/1",
          affiliate: false,
        },
      ],
    });
    const result = await runAutomaticPriceChecks(
      storage,
      request,
      new Date("2026-09-15T12:00:00.000Z"),
    );
    expect(result).toMatchObject({ checked: 1, changed: true });
    expect(result.notifications[0]?.detail).toContain("Target reached");
    expect(result.notifications[0]?.detail).toContain("fell by");
    const saved = JSON.parse(storage.getItem(BUILD_STORAGE_KEY)!);
    expect(saved.items[0].workbench.quotes[0].price).toBe(200);
    expect(saved.items[0].workbench.watches[0].consecutiveFailures).toBe(0);
    expect(saved.items[0].workbench.watches[0]).not.toHaveProperty("lastError");
  });
});

function quote(price: number) {
  return {
    id: "ebay:offer-1",
    retailer: "eBay",
    title: "BMW E90 rear lights",
    partNumber: "63217252093",
    url: "https://www.ebay.de/itm/1",
    origin: "ebay-live",
    provider: "ebay",
    providerItemId: "offer-1",
    market: "DE",
    price,
    shipping: 10,
    extraCharges: 0,
    currency: "EUR",
    condition: "Used",
    sellerConfidence: "unknown",
    availability: "in-stock",
    destination: "DE",
    sellerHistory: "",
    warranty: "",
    returns: "",
    delivery: "",
    observedAt: "2026-09-01T00:00:00.000Z",
    affiliate: false,
  };
}

function snapshot(price: number) {
  return {
    observedAt: "2026-09-01T00:00:00.000Z",
    price,
    shipping: 10,
    extraCharges: 0,
    currency: "EUR",
    availability: "in-stock",
    sellerHistory: "",
    warranty: "",
    fitmentState: "unknown",
  };
}
