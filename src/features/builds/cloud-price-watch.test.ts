import { beforeEach, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  applyCloudPriceWatchResults,
  collectCloudPriceWatches,
  importCloudPriceWatchResults,
  syncCloudPriceWatches,
  type CloudPriceWatchResult,
} from "./cloud-price-watch";
import { BUILD_STORAGE_KEY } from "./build-storage";
import { VEHICLE_STORAGE_KEY } from "@/features/vehicles/vehicle-storage";

const watchId = "00000000-0000-4000-8000-000000000001";

describe("scheduled cloud price watches", () => {
  beforeEach(() => {
    localStorage.clear();
    seedWorkbench();
  });

  it("collects only exact connected offers and enforces the worker interval floor", () => {
    expect(collectCloudPriceWatches(localStorage)).toEqual([
      expect.objectContaining({
        watch_id: watchId,
        provider: "ebay",
        provider_item_id: "offer-1",
        query: "63217252093",
        interval_hours: 6,
        target_price: 220,
      }),
    ]);
  });

  it("imports a newer exact result into the existing workbench", () => {
    const result: CloudPriceWatchResult = {
      watch_id: watchId,
      status: "available",
      checked_at: "2026-09-30T18:00:00.000Z",
      next_check_at: "2026-10-01T00:00:00.000Z",
      error_message: null,
      consumed_at: null,
      result: {
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
    };

    const applied = applyCloudPriceWatchResults(localStorage, [result]);
    const saved = JSON.parse(localStorage.getItem(BUILD_STORAGE_KEY)!);

    expect(applied.changed).toBe(true);
    expect(applied.notifications[0]?.detail).toContain("Target reached");
    expect(saved.items[0].workbench.quotes[0].price).toBe(200);
    expect(saved.items[0].workbench.watches[0]).toMatchObject({
      checkedAt: result.checked_at,
      nextCheckAt: result.next_check_at,
      consecutiveFailures: 0,
    });
  });

  it("syncs and imports a signed-in exact-offer watch through the cloud boundary", async () => {
    const cloud = createCloudHarness();
    const userId = "00000000-0000-4000-8000-000000000099";

    await expect(
      syncCloudPriceWatches(cloud.client, userId, localStorage),
    ).resolves.toEqual({ supported: true, count: 1 });
    expect(cloud.subscriptions).toEqual([
      expect.objectContaining({
        user_id: userId,
        watch_id: watchId,
        provider_item_id: "offer-1",
        interval_hours: 6,
      }),
    ]);

    cloud.results.push({
      user_id: userId,
      watch_id: watchId,
      status: "available",
      checked_at: "2026-10-01T12:00:00.000Z",
      next_check_at: "2026-10-01T18:00:00.000Z",
      error_message: null,
      consumed_at: null,
      result: {
        id: "offer-1",
        providerItemId: "offer-1",
        provider: "ebay",
        retailer: "eBay",
        title: "BMW E90 rear lights · refreshed",
        price: 205,
        shipping: 10,
        currency: "EUR",
        country: "DE",
        condition: "Used",
        url: "https://www.ebay.de/itm/1",
        affiliate: false,
      },
    });

    const imported = await importCloudPriceWatchResults(
      cloud.client,
      userId,
      localStorage,
    );
    const saved = JSON.parse(localStorage.getItem(BUILD_STORAGE_KEY)!);

    expect(imported.supported).toBe(true);
    expect(imported.changed).toBe(true);
    expect(saved.items[0].workbench.quotes[0].price).toBe(205);
    expect(cloud.results[0]?.consumed_at).toEqual(expect.any(String));
  });
});

function createCloudHarness() {
  const subscriptions: Record<string, unknown>[] = [];
  const results: Record<string, unknown>[] = [];
  const client = {
    from(table: string) {
      if (table === "price_watch_subscriptions") {
        return {
          upsert(rows: Record<string, unknown>[]) {
            subscriptions.splice(0, subscriptions.length, ...rows);
            return Promise.resolve({ error: null });
          },
          update() {
            return thenableQuery();
          },
        };
      }
      if (table === "price_watch_results") {
        return {
          select() {
            const query = thenableQuery();
            query.limit = () =>
              Promise.resolve({
                data: results.filter((result) => !result.consumed_at),
                error: null,
              });
            return query;
          },
          update(values: Record<string, unknown>) {
            const query = thenableQuery();
            query.in = (...args: unknown[]) => {
              const watchIds = args[1] as string[];
              for (const result of results) {
                if (watchIds.includes(String(result.watch_id)))
                  Object.assign(result, values);
              }
              return Promise.resolve({ error: null });
            };
            return query;
          },
        };
      }
      throw new Error(`Unexpected table ${table}`);
    },
  } as unknown as SupabaseClient;
  return { client, subscriptions, results };
}

function thenableQuery() {
  const result = Promise.resolve({ data: [], error: null });
  const query: Record<string, unknown> & {
    eq: (...args: unknown[]) => typeof query;
    is: (...args: unknown[]) => typeof query;
    not: (...args: unknown[]) => typeof query;
    order: (...args: unknown[]) => typeof query;
    in: (...args: unknown[]) => Promise<{ error: null }>;
    limit: (...args: unknown[]) => Promise<{ data: unknown[]; error: null }>;
    then: typeof result.then;
  } = {
    eq: () => query,
    is: () => query,
    not: () => query,
    order: () => query,
    in: () => Promise.resolve({ error: null }),
    limit: () => result,
    then: result.then.bind(result),
  };
  return query;
}

function seedWorkbench() {
  localStorage.setItem(
    VEHICLE_STORAGE_KEY,
    JSON.stringify([
      {
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
      },
    ]),
  );
  localStorage.setItem(
    BUILD_STORAGE_KEY,
    JSON.stringify({
      builds: [
        {
          id: "build-1",
          vehicleId: "vehicle-1",
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
            quotes: [
              {
                id: "ebay:offer-1",
                retailer: "eBay",
                title: "BMW E90 rear lights",
                partNumber: "63217252093",
                url: "https://www.ebay.de/itm/1",
                origin: "ebay-live",
                provider: "ebay",
                providerItemId: "offer-1",
                market: "DE",
                price: 250,
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
              },
            ],
            watches: [
              {
                id: watchId,
                quoteId: "ebay:offer-1",
                query: "BMW E90 rear lights",
                partNumber: "63217252093",
                destination: "DE",
                market: "DE",
                targetPrice: 220,
                createdAt: "2026-09-01T00:00:00.000Z",
                nextCheckAt: "2026-09-30T12:00:00.000Z",
                intervalHours: 1,
                snapshots: [
                  {
                    observedAt: "2026-09-01T00:00:00.000Z",
                    price: 250,
                    shipping: 10,
                    extraCharges: 0,
                    currency: "EUR",
                    availability: "in-stock",
                    sellerHistory: "",
                    warranty: "",
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
  );
}
