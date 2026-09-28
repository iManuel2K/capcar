import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createScoutDatabase,
  finishScoutRun,
  markSourceFailure,
  markSourceSuccess,
  pendingImageCount,
  recentlyCompletedShard,
  registerScoutCatalog,
  saveCandidates,
  sourceState,
  startScoutRun,
} from "./database";
import { getScoutEnvironment } from "./environment";
import { structuredDataCandidates } from "./parsers";
import { robotsAllows, scoutRequestHeaders } from "./robots";
import {
  entriesForShard,
  europeanPhotoTargets,
  roadbookScoutSources,
} from "./source-catalog";
import {
  SCOUT_SHARD_COUNT,
  type PhotoTarget,
  type ScoutRunSummary,
  type ScoutSource,
} from "./types";
import { searchUnsplashTarget } from "./unsplash";

const REQUEST_TIMEOUT_MS = 6_000;
const MAX_PENDING_IMAGES = 150;

async function withTimeout<T>(
  task: (signal: AbortSignal) => Promise<T>,
  timeoutMs = REQUEST_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await task(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

async function mapLimit<T>(
  items: readonly T[],
  concurrency: number,
  task: (item: T) => Promise<void>,
) {
  let nextIndex = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const item = items[nextIndex++];
        await task(item);
      }
    },
  );
  await Promise.all(workers);
}

async function inspectOfficialSource(
  client: SupabaseClient,
  source: ScoutSource,
) {
  const state = await sourceState(client, source);
  if (!state) return { checked: false, found: 0, skipped: "disabled" };

  try {
    const allowed = await withTimeout((signal) =>
      robotsAllows(source.url, signal),
    );
    if (!allowed) {
      await markSourceFailure(
        client,
        source.key,
        "Blocked by robots.txt or robots unavailable",
      );
      return { checked: true, found: 0, skipped: "robots" };
    }

    const response = await withTimeout((signal) => {
      const conditionalHeaders: Record<string, string> = {
        ...scoutRequestHeaders,
      };
      if (state.response_etag)
        conditionalHeaders["If-None-Match"] = state.response_etag;
      if (state.response_last_modified)
        conditionalHeaders["If-Modified-Since"] = state.response_last_modified;
      return fetch(source.url, {
        headers: conditionalHeaders,
        redirect: "follow",
        signal,
      });
    });

    if (response.status === 304) {
      await markSourceSuccess(client, source.key, response);
      return { checked: true, found: 0 };
    }
    if (!response.ok)
      throw new Error(`Official source returned ${response.status}`);

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > 2_000_000)
      throw new Error("Official source exceeds 2 MB");
    const html = (await response.text()).slice(0, 2_000_000);
    const candidates = await structuredDataCandidates(html, source);
    const found = await saveCandidates(client, candidates);
    await markSourceSuccess(client, source.key, response);
    return { checked: true, found };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown source error";
    await markSourceFailure(client, source.key, message);
    throw new Error(`${source.key}: ${message}`);
  }
}

function rotatingUnsplashPage(now = Date.now()) {
  return (Math.floor(now / (7 * 24 * 60 * 60 * 1_000)) % 5) + 1;
}

async function inspectPhotoTarget(
  client: SupabaseClient,
  target: PhotoTarget,
  accessKey: string,
  page: number,
) {
  const candidate = await withTimeout((signal) =>
    searchUnsplashTarget(target, accessKey, page, signal),
  );
  return candidate ? saveCandidates(client, [candidate]) : 0;
}

export async function runRoadbookScout(input: {
  shard: number;
  force?: boolean;
}) {
  if (input.shard < 0 || input.shard >= SCOUT_SHARD_COUNT) {
    throw new Error("Invalid Roadbook Scout shard");
  }

  const environment = getScoutEnvironment();
  const client = createScoutDatabase(
    environment.supabaseUrl,
    environment.supabaseSecretKey,
  );
  await registerScoutCatalog(client);

  if (!input.force && (await recentlyCompletedShard(client, input.shard))) {
    return {
      status: "already-run",
      summary: {
        shard: input.shard,
        sourcesChecked: 0,
        photosChecked: 0,
        candidatesFound: 0,
        skipped: ["Shard completed within the last six days"],
        errors: [],
      } satisfies ScoutRunSummary,
    };
  }

  const runId = await startScoutRun(client, input.shard);
  const summary: ScoutRunSummary = {
    shard: input.shard,
    sourcesChecked: 0,
    photosChecked: 0,
    candidatesFound: 0,
    skipped: [],
    errors: [],
  };

  try {
    const sources = entriesForShard(
      roadbookScoutSources,
      input.shard,
      SCOUT_SHARD_COUNT,
    );
    const photoTargets = entriesForShard(
      europeanPhotoTargets,
      input.shard,
      SCOUT_SHARD_COUNT,
    );

    const sourceWork = mapLimit(sources, 4, async (source) => {
      try {
        const result = await inspectOfficialSource(client, source);
        if (result.checked) summary.sourcesChecked += 1;
        summary.candidatesFound += result.found;
        if (result.skipped)
          summary.skipped.push(`${source.key}: ${result.skipped}`);
      } catch (error) {
        summary.errors.push(
          error instanceof Error
            ? error.message
            : `${source.key}: unknown error`,
        );
      }
    });

    const photoWork = (async () => {
      if (!environment.unsplashAccessKey) {
        summary.skipped.push(
          "Unsplash disabled: UNSPLASH_ACCESS_KEY is not configured",
        );
        return;
      }
      const pending = await pendingImageCount(client);
      if (pending >= MAX_PENDING_IMAGES) {
        summary.skipped.push(
          `Unsplash paused: ${pending} images are waiting for review`,
        );
        return;
      }

      const remainingCapacity = MAX_PENDING_IMAGES - pending;
      const targets = photoTargets.slice(0, remainingCapacity);
      const page = rotatingUnsplashPage();
      await mapLimit(targets, 5, async (target) => {
        try {
          summary.candidatesFound += await inspectPhotoTarget(
            client,
            target,
            environment.unsplashAccessKey!,
            page,
          );
          summary.photosChecked += 1;
        } catch (error) {
          summary.errors.push(
            `${target.key}: ${error instanceof Error ? error.message : "unknown error"}`,
          );
        }
      });
    })();

    await Promise.all([sourceWork, photoWork]);
    const status = summary.errors.length ? "partial" : "completed";
    await finishScoutRun(client, runId, summary, status);
    return { status, summary };
  } catch (error) {
    summary.errors.push(
      error instanceof Error ? error.message : "Unknown scout error",
    );
    await finishScoutRun(client, runId, summary, "failed");
    throw error;
  }
}

export function isAuthorizedManualRun(request: Request) {
  const expected = getScoutEnvironment().manualRunSecret;
  const supplied = request.headers.get("x-roadbook-scout-secret");
  return Boolean(expected && supplied && expected === supplied);
}
