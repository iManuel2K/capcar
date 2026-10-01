import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { RetailUnavailable } from "../../../../src/features/retail/ebay-provider";
import { searchRetailers } from "../../../../src/features/retail/multi-retailer-provider";
import { retailRequestSchema } from "../../../../src/features/retail/retail-contracts";
import { getPriceWatchEnvironment } from "./environment";

const MAX_CHECKS_PER_RUN = 24;
const CONCURRENCY = 2;

type Subscription = {
  user_id: string;
  watch_id: string;
  provider: "ebay" | "partner";
  provider_item_id: string;
  query: string;
  part_number: string | null;
  market: "DE" | "GB" | "FR" | "IT" | "ES" | "US";
  destination: "DE" | "AT" | "FR" | "IT" | "ES" | "NL" | "BE" | "GB" | "US";
  interval_hours: number;
  consecutive_failures: number;
};

export async function runScheduledPriceWatches(now = new Date()) {
  const environment = getPriceWatchEnvironment();
  const client = createClient(
    environment.supabaseUrl,
    environment.supabaseSecretKey,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "X-Client-Info": "capcar-price-watch/1.0" } },
    },
  );
  const runId = await startRun(client);
  const errors: string[] = [];
  let checked = 0;
  let updated = 0;

  try {
    const { data, error } = await client
      .from("price_watch_subscriptions")
      .select(
        "user_id,watch_id,provider,provider_item_id,query,part_number,market,destination,interval_hours,consecutive_failures",
      )
      .eq("enabled", true)
      .lte("next_check_at", now.toISOString())
      .order("next_check_at", { ascending: true })
      .limit(MAX_CHECKS_PER_RUN)
      .returns<Subscription[]>();
    if (error)
      throw new Error(`Could not read due price watches: ${error.message}`);

    await mapLimit(data ?? [], CONCURRENCY, async (watch) => {
      checked += 1;
      try {
        await checkOne(client, watch, environment.providers, now);
        updated += 1;
      } catch (error) {
        errors.push(
          `${watch.watch_id}: ${error instanceof Error ? error.message.slice(0, 160) : "unknown failure"}`,
        );
      }
    });

    const status = errors.length ? "partial" : "completed";
    await finishRun(client, runId, status, checked, updated, errors);
    return { status, checked, updated, errors: errors.length };
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Unknown worker failure",
    );
    await finishRun(client, runId, "failed", checked, updated, errors);
    throw error;
  }
}

async function checkOne(
  client: SupabaseClient,
  watch: Subscription,
  environment: Record<string, string | undefined>,
  now: Date,
) {
  const input = retailRequestSchema.parse({
    query: watch.part_number || watch.query,
    market: watch.market,
    destination: watch.destination,
    page: 0,
  });
  try {
    const response = await searchRetailers(input, environment);
    if (response.freshness === "stale")
      throw new RetailUnavailable(
        "Retailers returned only a previous observation.",
        "unavailable",
      );
    const item = response.items.find(
      (candidate) =>
        candidate.provider === watch.provider &&
        (candidate.providerItemId ?? candidate.id) === watch.provider_item_id,
    );
    const nextCheckAt = addHours(now, watch.interval_hours).toISOString();
    await updateSubscription(client, watch, {
      last_checked_at: now.toISOString(),
      next_check_at: nextCheckAt,
      consecutive_failures: item
        ? 0
        : Math.min(20, watch.consecutive_failures + 1),
      last_error: item
        ? null
        : "The exact offer was not returned in the current result window.",
    });
    await upsertResult(client, watch, {
      status: item ? "available" : "missing",
      result: item ?? null,
      checked_at: response.checkedAt,
      next_check_at: nextCheckAt,
      error_code: item ? null : "missing",
      error_message: item
        ? null
        : "The exact offer was not returned in the current result window.",
    });
  } catch (error) {
    const failures = Math.min(20, watch.consecutive_failures + 1);
    const retryHours = Math.min(
      24,
      watch.interval_hours * 2 ** Math.min(failures - 1, 3),
    );
    const nextCheckAt = addHours(now, retryHours).toISOString();
    const normalized = normalizeFailure(error);
    await updateSubscription(client, watch, {
      last_checked_at: now.toISOString(),
      next_check_at: nextCheckAt,
      consecutive_failures: failures,
      last_error: normalized.message,
    });
    await upsertResult(client, watch, {
      status: "error",
      result: null,
      checked_at: now.toISOString(),
      next_check_at: nextCheckAt,
      error_code: normalized.code,
      error_message: normalized.message,
    });
  }
}

async function updateSubscription(
  client: SupabaseClient,
  watch: Subscription,
  values: Record<string, unknown>,
) {
  const { error } = await client
    .from("price_watch_subscriptions")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("user_id", watch.user_id)
    .eq("watch_id", watch.watch_id);
  if (error) throw new Error(`Could not update subscription: ${error.message}`);
}

async function upsertResult(
  client: SupabaseClient,
  watch: Subscription,
  values: Record<string, unknown>,
) {
  const { error } = await client.from("price_watch_results").upsert(
    {
      user_id: watch.user_id,
      watch_id: watch.watch_id,
      ...values,
      consumed_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,watch_id" },
  );
  if (error) throw new Error(`Could not store price result: ${error.message}`);
}

function normalizeFailure(error: unknown) {
  if (error instanceof RetailUnavailable) {
    return {
      code:
        error.kind === "configuration" || error.kind === "authorization"
          ? "access"
          : error.kind === "rate_limit"
            ? "limit"
            : error.kind === "timeout"
              ? "timeout"
              : "unavailable",
      message: error.message.slice(0, 200),
    };
  }
  return {
    code: "unavailable",
    message: "Retailer check could not be completed.".slice(0, 200),
  };
}

async function startRun(client: SupabaseClient) {
  const { data, error } = await client
    .from("price_watch_runs")
    .insert({ status: "running" })
    .select("id")
    .single<{ id: string }>();
  if (error)
    throw new Error(`Could not start price-watch run: ${error.message}`);
  return data.id;
}

async function finishRun(
  client: SupabaseClient,
  runId: string,
  status: "completed" | "partial" | "failed",
  checked: number,
  updated: number,
  errors: string[],
) {
  const { error } = await client
    .from("price_watch_runs")
    .update({
      status,
      watches_checked: checked,
      results_updated: updated,
      errors,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId);
  if (error)
    throw new Error(`Could not finish price-watch run: ${error.message}`);
}

async function mapLimit<T>(
  items: readonly T[],
  concurrency: number,
  task: (item: T) => Promise<void>,
) {
  let next = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (next < items.length) await task(items[next++]!);
    },
  );
  await Promise.all(workers);
}

function addHours(value: Date, hours: number) {
  return new Date(value.getTime() + hours * 60 * 60 * 1_000);
}
