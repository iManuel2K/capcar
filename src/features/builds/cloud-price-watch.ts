import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { BUILD_STORAGE_KEY, readBuildState } from "./build-storage";
import {
  workbenchSchema,
  type BuildQuote,
  type PriceWatch,
} from "./build-workbench-schema";
import { refreshPriceWatches } from "./price-watch";
import type { NotificationItem } from "@/features/notifications/notification-schema";
import { safeRetailUrl } from "@/features/retail/retail-contracts";
import { readVehicles } from "@/features/vehicles/vehicle-storage";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "getItem" | "setItem">;

const cloudWatchSchema = z.object({
  watch_id: z.string().uuid(),
  vehicle_id: z.string().min(1).max(120),
  vehicle_label: z.string().min(2).max(160),
  build_id: z.string().min(1).max(120),
  item_id: z.string().min(1).max(120),
  quote_id: z.string().min(1).max(220),
  provider: z.enum(["ebay", "partner"]),
  provider_item_id: z.string().min(1).max(220),
  query: z.string().trim().min(3).max(100),
  part_number: z.string().trim().max(80).nullable(),
  market: z.enum(["DE", "GB", "FR", "IT", "ES", "US"]),
  destination: z.enum(["DE", "AT", "FR", "IT", "ES", "NL", "BE", "GB", "US"]),
  target_price: z.number().nonnegative().nullable(),
  interval_hours: z.number().int().min(6).max(168),
  enabled: z.boolean(),
  next_check_at: z.iso.datetime(),
});

const cloudResultItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  price: z.number().finite().nonnegative(),
  currency: z.enum(["EUR", "GBP", "USD"]),
  shipping: z.number().finite().nonnegative().nullable(),
  country: z.string().nullable(),
  condition: z.string(),
  url: z.string().refine(safeRetailUrl),
  affiliate: z.boolean(),
  retailer: z.string().max(80).optional(),
  provider: z.enum(["ebay", "partner"]),
  providerItemId: z.string().min(1).max(220),
});

const cloudResultSchema = z.object({
  watch_id: z.string().uuid(),
  status: z.enum(["available", "missing", "error"]),
  result: cloudResultItemSchema.nullable(),
  checked_at: z.iso.datetime(),
  next_check_at: z.iso.datetime(),
  error_message: z.string().max(200).nullable(),
  consumed_at: z.iso.datetime().nullable(),
});

export type CloudPriceWatch = z.infer<typeof cloudWatchSchema>;
export type CloudPriceWatchResult = z.infer<typeof cloudResultSchema>;

export function collectCloudPriceWatches(
  storage: ReadableStorage,
): CloudPriceWatch[] {
  const state = readBuildState(storage);
  const vehicles = new Map(
    readVehicles(storage).map((vehicle) => [vehicle.id, vehicle]),
  );
  const builds = new Map(state.builds.map((build) => [build.id, build]));
  const watches: CloudPriceWatch[] = [];

  for (const item of state.items) {
    const build = builds.get(item.buildId);
    const vehicle = build ? vehicles.get(build.vehicleId) : undefined;
    if (!build || !vehicle) continue;
    const workbench = workbenchSchema.parse(item.workbench ?? {});
    for (const watch of workbench.watches) {
      if (!watch.enabled || watches.length >= 50) continue;
      const quote = workbench.quotes.find(
        (entry) => entry.id === watch.quoteId,
      );
      if (!quote?.provider || !quote.providerItemId) continue;
      const parsed = cloudWatchSchema.safeParse({
        watch_id: watch.id,
        vehicle_id: vehicle.id,
        vehicle_label: `${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`,
        build_id: build.id,
        item_id: item.id,
        quote_id: quote.id,
        provider: quote.provider,
        provider_item_id: quote.providerItemId,
        query: (watch.partNumber || watch.query).slice(0, 100),
        part_number: watch.partNumber || null,
        market: watch.market,
        destination: watch.destination.toUpperCase(),
        target_price: watch.targetPrice ?? null,
        interval_hours: Math.max(6, watch.intervalHours),
        enabled: true,
        next_check_at: watch.nextCheckAt ?? new Date().toISOString(),
      });
      if (parsed.success) watches.push(parsed.data);
    }
  }
  return watches;
}

export async function syncCloudPriceWatches(
  client: SupabaseClient,
  userId: string,
  storage: ReadableStorage,
) {
  const watches = collectCloudPriceWatches(storage);
  const now = new Date().toISOString();
  if (watches.length) {
    const { error } = await client.from("price_watch_subscriptions").upsert(
      watches.map((watch) => ({
        ...watch,
        user_id: userId,
        updated_at: now,
      })),
      { onConflict: "user_id,watch_id" },
    );
    if (missingInfrastructure(error)) return { supported: false, count: 0 };
    if (error) throw error;
  }
  let disableQuery = client
    .from("price_watch_subscriptions")
    .update({ enabled: false, updated_at: now })
    .eq("user_id", userId)
    .eq("enabled", true);
  if (watches.length) {
    disableQuery = disableQuery.not(
      "watch_id",
      "in",
      `(${watches.map((watch) => watch.watch_id).join(",")})`,
    );
  }
  const disabled = await disableQuery;
  if (missingInfrastructure(disabled.error))
    return { supported: false, count: 0 };
  if (disabled.error) throw disabled.error;
  return { supported: true, count: watches.length };
}

export async function importCloudPriceWatchResults(
  client: SupabaseClient,
  userId: string,
  storage: WritableStorage,
) {
  const response = await client
    .from("price_watch_results")
    .select(
      "watch_id,status,result,checked_at,next_check_at,error_message,consumed_at",
    )
    .eq("user_id", userId)
    .is("consumed_at", null)
    .order("checked_at", { ascending: true })
    .limit(50);
  if (missingInfrastructure(response.error))
    return { supported: false, changed: false, notifications: [] };
  if (response.error) throw response.error;
  const parsed = cloudResultSchema.array().safeParse(response.data ?? []);
  if (!parsed.success)
    throw new Error("Scheduled price-watch results could not be validated.");
  const applied = applyCloudPriceWatchResults(storage, parsed.data);
  if (parsed.data.length) {
    const { error } = await client
      .from("price_watch_results")
      .update({ consumed_at: new Date().toISOString() })
      .eq("user_id", userId)
      .in(
        "watch_id",
        parsed.data.map((result) => result.watch_id),
      );
    if (error) throw error;
  }
  return { supported: true, ...applied };
}

export function applyCloudPriceWatchResults(
  storage: WritableStorage,
  input: CloudPriceWatchResult[],
) {
  const results = new Map(input.map((result) => [result.watch_id, result]));
  const state = readBuildState(storage);
  const vehicles = new Map(
    readVehicles(storage).map((vehicle) => [vehicle.id, vehicle]),
  );
  const builds = new Map(state.builds.map((build) => [build.id, build]));
  const notifications: NotificationItem[] = [];
  let changed = false;

  for (const item of state.items) {
    const build = builds.get(item.buildId);
    const vehicle = build ? vehicles.get(build.vehicleId) : undefined;
    if (!build || !vehicle) continue;
    const workbench = workbenchSchema.parse(item.workbench ?? {});
    let itemChanged = false;
    for (const watch of workbench.watches) {
      const result = results.get(watch.id);
      if (!result || isOlder(result.checked_at, watch.checkedAt)) continue;
      const quote = workbench.quotes.find(
        (entry) => entry.id === watch.quoteId,
      );
      if (result.status === "available" && result.result && quote) {
        const nextQuote: BuildQuote = {
          ...quote,
          title: result.result.title,
          price: result.result.price,
          shipping: result.result.shipping,
          condition: result.result.condition,
          url: result.result.url,
          affiliate: result.result.affiliate,
          retailer: result.result.retailer ?? quote.retailer,
          observedAt: result.checked_at,
        };
        workbench.quotes = workbench.quotes.map((entry) =>
          entry.id === quote.id ? nextQuote : entry,
        );
        const refreshed = refreshPriceWatches(
          { ...workbench, watches: [watch] },
          vehicle,
          `${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`,
          `/garage/${vehicle.id}/builds/${build.id}#workbench`,
          result.checked_at,
        );
        notifications.push(...refreshed.notifications);
        replaceWatch(workbench, {
          ...refreshed.workbench.watches[0]!,
          checkedAt: result.checked_at,
          nextCheckAt: result.next_check_at,
          consecutiveFailures: 0,
          lastError: undefined,
        });
      } else {
        replaceWatch(workbench, {
          ...watch,
          checkedAt: result.checked_at,
          nextCheckAt: result.next_check_at,
          consecutiveFailures: Math.min(20, watch.consecutiveFailures + 1),
          lastError:
            result.error_message ??
            (result.status === "missing"
              ? "The exact offer was not returned in the current result window."
              : "Scheduled retailer check failed."),
        });
      }
      itemChanged = true;
      changed = true;
    }
    if (itemChanged) item.workbench = workbench;
  }
  if (changed) storage.setItem(BUILD_STORAGE_KEY, JSON.stringify(state));
  return { changed, notifications };
}

function replaceWatch(
  workbench: ReturnType<typeof workbenchSchema.parse>,
  watch: PriceWatch,
) {
  workbench.watches = workbench.watches.map((entry) =>
    entry.id === watch.id ? watch : entry,
  );
}

function isOlder(checkedAt: string, current?: string) {
  return Boolean(
    current && new Date(checkedAt).getTime() <= new Date(current).getTime(),
  );
}

function missingInfrastructure(error: { code?: string } | null) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}
