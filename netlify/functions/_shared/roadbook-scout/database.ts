import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { europeanPhotoTargets, roadbookScoutSources } from "./source-catalog";
import type { DiscoveryCandidate, ScoutRunSummary, ScoutSource } from "./types";

type SourceState = {
  source_key: string;
  response_etag: string | null;
  response_last_modified: string | null;
};

export function createScoutDatabase(url: string, secretKey: string) {
  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "capcar-roadbook-scout/1.0" } },
  });
}

export async function registerScoutCatalog(client: SupabaseClient) {
  const officialSources = roadbookScoutSources.map((source) => ({
    source_key: source.key,
    source_kind: source.kind,
    scope: source.scope,
    name: source.name,
    source_url: source.url,
    country_code: source.countryCode,
    updated_at: new Date().toISOString(),
  }));
  const imageSources = europeanPhotoTargets.map((target) => ({
    source_key: target.key,
    source_kind: "image_query",
    scope: "europe",
    name: target.region,
    source_url: `https://unsplash.com/s/photos/${encodeURIComponent(target.query)}`,
    country_code: target.countryCode,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await client
    .from("roadbook_scout_sources")
    .upsert([...officialSources, ...imageSources], {
      onConflict: "source_key",
    });
  if (error)
    throw new Error(`Could not register scout sources: ${error.message}`);
}

export async function sourceState(client: SupabaseClient, source: ScoutSource) {
  const { data, error } = await client
    .from("roadbook_scout_sources")
    .select("source_key,response_etag,response_last_modified")
    .eq("source_key", source.key)
    .eq("enabled", true)
    .maybeSingle<SourceState>();
  if (error) throw new Error(`Could not read ${source.key}: ${error.message}`);
  return data;
}

export async function markSourceSuccess(
  client: SupabaseClient,
  key: string,
  response: Response,
) {
  const now = new Date().toISOString();
  const { error } = await client
    .from("roadbook_scout_sources")
    .update({
      last_checked_at: now,
      last_success_at: now,
      last_error: null,
      consecutive_failures: 0,
      response_etag: response.headers.get("etag"),
      response_last_modified: response.headers.get("last-modified"),
      updated_at: now,
    })
    .eq("source_key", key);
  if (error) throw new Error(`Could not update ${key}: ${error.message}`);
}

export async function markSourceFailure(
  client: SupabaseClient,
  key: string,
  message: string,
) {
  const { data } = await client
    .from("roadbook_scout_sources")
    .select("consecutive_failures")
    .eq("source_key", key)
    .maybeSingle<{ consecutive_failures: number }>();
  const { error } = await client
    .from("roadbook_scout_sources")
    .update({
      last_checked_at: new Date().toISOString(),
      last_error: message.slice(0, 500),
      consecutive_failures: (data?.consecutive_failures ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("source_key", key);
  if (error)
    throw new Error(`Could not record ${key} failure: ${error.message}`);
}

export async function saveCandidates(
  client: SupabaseClient,
  candidates: DiscoveryCandidate[],
) {
  if (!candidates.length) return 0;
  const now = new Date().toISOString();
  let stored = 0;

  for (const candidate of candidates) {
    const record = {
      candidate_kind: candidate.kind,
      fingerprint: candidate.fingerprint,
      source_key: candidate.sourceKey,
      title: candidate.title,
      source_url: candidate.sourceUrl,
      country_code: candidate.countryCode,
      region: candidate.region,
      confidence: candidate.confidence,
      payload: candidate.payload,
      last_seen_at: now,
      updated_at: now,
    };
    const { error: insertError } = await client
      .from("roadbook_discovery_candidates")
      .insert(record);
    if (insertError?.code === "23505") {
      const { error: updateError } = await client
        .from("roadbook_discovery_candidates")
        .update({
          source_key: record.source_key,
          title: record.title,
          source_url: record.source_url,
          country_code: record.country_code,
          region: record.region,
          confidence: record.confidence,
          payload: record.payload,
          last_seen_at: record.last_seen_at,
          updated_at: record.updated_at,
        })
        .eq("candidate_kind", candidate.kind)
        .eq("fingerprint", candidate.fingerprint);
      if (updateError) {
        throw new Error(
          `Could not refresh ${candidate.kind} candidate: ${updateError.message}`,
        );
      }
    } else if (insertError) {
      throw new Error(
        `Could not store ${candidate.kind} candidate: ${insertError.message}`,
      );
    }
    stored += 1;
  }

  return stored;
}

export async function pendingImageCount(client: SupabaseClient) {
  const { count, error } = await client
    .from("roadbook_discovery_candidates")
    .select("id", { count: "exact", head: true })
    .eq("candidate_kind", "image")
    .eq("status", "pending");
  if (error)
    throw new Error(`Could not count pending images: ${error.message}`);
  return count ?? 0;
}

export async function recentlyCompletedShard(
  client: SupabaseClient,
  shard: number,
) {
  const cutoff = new Date(Date.now() - 6 * 24 * 60 * 60 * 1_000).toISOString();
  const { count, error } = await client
    .from("roadbook_ingestion_runs")
    .select("id", { count: "exact", head: true })
    .eq("shard", shard)
    .in("status", ["completed", "partial"])
    .gte("started_at", cutoff);
  if (error) throw new Error(`Could not inspect recent runs: ${error.message}`);
  return (count ?? 0) > 0;
}

export async function startScoutRun(client: SupabaseClient, shard: number) {
  const { data, error } = await client
    .from("roadbook_ingestion_runs")
    .insert({ shard, status: "running" })
    .select("id")
    .single<{ id: string }>();
  if (error) throw new Error(`Could not start scout run: ${error.message}`);
  return data.id;
}

export async function finishScoutRun(
  client: SupabaseClient,
  runId: string,
  summary: ScoutRunSummary,
  status: "completed" | "partial" | "failed",
) {
  const { error } = await client
    .from("roadbook_ingestion_runs")
    .update({
      status,
      sources_checked: summary.sourcesChecked,
      photos_checked: summary.photosChecked,
      candidates_found: summary.candidatesFound,
      skipped: summary.skipped,
      errors: summary.errors,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId);
  if (error) throw new Error(`Could not finish scout run: ${error.message}`);
}
