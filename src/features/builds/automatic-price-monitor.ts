import {
  BUILD_STORAGE_KEY,
  readBuildState,
} from "@/features/builds/build-storage";
import {
  workbenchSchema,
  type BuildQuote,
  type PriceWatch,
} from "@/features/builds/build-workbench-schema";
import { refreshPriceWatches } from "@/features/builds/price-watch";
import type { NotificationItem } from "@/features/notifications/notification-schema";
import { requestRetail } from "@/features/retail/search-client";
import { retailRequestSchema } from "@/features/retail/retail-contracts";
import { readVehicles } from "@/features/vehicles/vehicle-storage";

type WritableStorage = Pick<Storage, "getItem" | "setItem">;
type RetailRequest = typeof requestRetail;

const destinationCodes = new Set([
  "DE",
  "AT",
  "FR",
  "IT",
  "ES",
  "NL",
  "BE",
  "GB",
  "US",
]);

export async function runAutomaticPriceChecks(
  storage: WritableStorage,
  request: RetailRequest = requestRetail,
  now = new Date(),
  maximumChecks = 3,
) {
  const state = readBuildState(storage);
  const vehicles = readVehicles(storage);
  const notifications: NotificationItem[] = [];
  let checked = 0;
  let changed = false;

  for (const item of state.items) {
    if (checked >= maximumChecks) break;
    const workbench = workbenchSchema.parse(item.workbench ?? {});
    let itemChanged = false;
    const vehicle = vehicles.find((entry) =>
      state.builds.some(
        (build) => build.id === item.buildId && build.vehicleId === entry.id,
      ),
    );
    if (!vehicle) continue;
    for (const watch of workbench.watches) {
      if (checked >= maximumChecks) break;
      const quote = workbench.quotes.find(
        (entry) => entry.id === watch.quoteId,
      );
      if (!quote || quote.origin === "owner-quote" || !due(watch, now))
        continue;
      checked += 1;
      const destination = quote.destination.toUpperCase();
      if (!destinationCodes.has(destination)) {
        replaceWatch(
          workbench,
          failed(watch, now, "Confirm a supported delivery country."),
        );
        changed = true;
        itemChanged = true;
        continue;
      }
      try {
        const input = retailRequestSchema.parse({
          query: watch.partNumber || watch.query,
          market: watch.market,
          destination,
          page: 0,
        });
        const result = await request(input, AbortSignal.timeout(25_000));
        const observation = result.items.find(
          (candidate) =>
            candidate.provider === quote.provider &&
            (candidate.providerItemId ?? candidate.id) ===
              (quote.providerItemId ?? providerId(quote)),
        );
        if (!observation) {
          replaceWatch(
            workbench,
            failed(
              watch,
              now,
              "The exact offer was not returned in the current result window.",
            ),
          );
          changed = true;
          itemChanged = true;
          continue;
        }
        const updatedQuote: BuildQuote = {
          ...quote,
          title: observation.title,
          price: observation.price,
          shipping: observation.shipping,
          condition: observation.condition,
          url: observation.url,
          affiliate: observation.affiliate,
          observedAt: result.checkedAt,
          retailer: observation.retailer ?? quote.retailer,
        };
        workbench.quotes = workbench.quotes.map((entry) =>
          entry.id === quote.id ? updatedQuote : entry,
        );
        const refreshed = refreshOneWatch(
          workbench,
          watch,
          vehicle,
          `${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`,
          `/garage/${vehicle.id}/builds/${item.buildId}#workbench`,
          now,
        );
        replaceWatch(workbench, refreshed.watch);
        notifications.push(...refreshed.notifications);
        changed = true;
        itemChanged = true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message.slice(0, 200)
            : "Retailer check failed.";
        replaceWatch(workbench, failed(watch, now, message));
        changed = true;
        itemChanged = true;
      }
    }
    if (itemChanged) item.workbench = workbench;
  }

  if (changed) storage.setItem(BUILD_STORAGE_KEY, JSON.stringify(state));
  return { checked, changed, notifications };
}

function refreshOneWatch(
  workbench: ReturnType<typeof workbenchSchema.parse>,
  watch: PriceWatch,
  vehicle: Parameters<typeof refreshPriceWatches>[1],
  label: string,
  href: string,
  now: Date,
): PriceWatchRefreshResult {
  const result = refreshPriceWatches(
    { ...workbench, watches: [watch] },
    vehicle,
    label,
    href,
    now.toISOString(),
  );
  const refreshed = result.workbench.watches[0]!;
  return {
    watch: {
      ...refreshed,
      checkedAt: now.toISOString(),
      nextCheckAt: addHours(now, watch.intervalHours).toISOString(),
      consecutiveFailures: 0,
      lastError: undefined,
    },
    notifications: result.notifications,
  };
}

function due(watch: PriceWatch, now: Date) {
  return (
    watch.enabled &&
    (!watch.nextCheckAt ||
      new Date(watch.nextCheckAt).getTime() <= now.getTime())
  );
}

function failed(watch: PriceWatch, now: Date, message: string): PriceWatch {
  const failures = Math.min(20, watch.consecutiveFailures + 1);
  return {
    ...watch,
    checkedAt: now.toISOString(),
    nextCheckAt: addHours(
      now,
      Math.min(24, watch.intervalHours * 2 ** Math.min(failures - 1, 3)),
    ).toISOString(),
    consecutiveFailures: failures,
    lastError: message,
  };
}

function replaceWatch(
  workbench: ReturnType<typeof workbenchSchema.parse>,
  watch: PriceWatch,
) {
  workbench.watches = workbench.watches.map((entry) =>
    entry.id === watch.id ? watch : entry,
  );
}

function providerId(quote: BuildQuote) {
  return quote.id.includes(":")
    ? quote.id.slice(quote.id.indexOf(":") + 1)
    : quote.id;
}

function addHours(value: Date, hours: number) {
  return new Date(value.getTime() + hours * 60 * 60 * 1000);
}

export type PriceWatchRefreshResult = {
  watch: PriceWatch;
  notifications: NotificationItem[];
};
