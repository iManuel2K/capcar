import { z } from "zod";
import { getProblemProfile } from "./source-profiles";
import {
  officialProblemResultSchema,
  type OfficialProblemResult,
} from "./official-records-schema";

export const PROBLEM_CACHE_SECONDS = 6 * 60 * 60;
const sourceRow = z.object({
  modelYear: z.string(),
  make: z.string(),
  model: z.string().max(100),
});
const modelsSchema = z.object({ results: z.array(sourceRow).max(2000) });
const recallRow = z.object({
  NHTSACampaignNumber: z.string().regex(/^\d{2}[A-Z]\d{6}$/),
  Component: z.string().min(1).max(500),
  Summary: z.string().min(1).max(12000),
  Consequence: z.string().max(12000).nullish(),
  Remedy: z.string().max(12000).nullish(),
  ReportReceivedDate: z.string().max(40).nullish(),
  ModelYear: z.string(),
  Make: z.string(),
  Model: z.string(),
  parkIt: z.boolean().optional(),
  parkOutSide: z.boolean().optional(),
});
const recallSchema = z.object({ results: z.array(recallRow).max(200) });
type Fetcher = typeof fetch;
const normalized = (text: string) => text.trim().toUpperCase();

async function sourceJson(url: URL, fetcher: Fetcher) {
  // A fixed official host, no caller-controlled URLs or redirects, no cookies,
  // VINs, accounts or vehicle IDs. Cache only the validated compact result.
  const response = await fetcher(url, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8000),
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Official source unavailable");
  if (!response.headers.get("content-type")?.includes("json"))
    throw new Error("Unexpected source format");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty source response");
  const decoder = new TextDecoder();
  let size = 0,
    text = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 1_000_000) throw new Error("Source response exceeds limit");
      text += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode()) as unknown;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function fetchOfficialProblems(
  profileId: string,
  year: number,
  fetcher: Fetcher = fetch,
): Promise<OfficialProblemResult> {
  const profile = getProblemProfile(profileId);
  if (
    !profile ||
    !Number.isInteger(year) ||
    year < profile.years[0] ||
    year > profile.years[1]
  )
    throw new Error("Unsupported profile/year");
  const base: OfficialProblemResult = {
    profile: profileId,
    year,
    status: "unsupported",
    fetchedAt: null,
    source: "NHTSA",
    market: "US",
    matchedModels: [],
    records: [],
  };
  const { mapping } = profile;
  if (!mapping.models.length)
    return { ...base, reason: mapping.reason ?? "market" };
  if (mapping.years && (year < mapping.years[0] || year > mapping.years[1]))
    return { ...base, reason: "year" };
  const make = normalized(profile.make);
  const indexUrl = new URL("https://api.nhtsa.gov/products/vehicle/models");
  indexUrl.search = new URLSearchParams({
    modelYear: String(year),
    make,
    issueType: "r",
  }).toString();
  const index = modelsSchema.parse(await sourceJson(indexUrl, fetcher));
  base.fetchedAt = new Date().toISOString();
  const names = new Set(
    index.results
      .filter(
        (row) =>
          Number(row.modelYear) === year && normalized(row.make) === make,
      )
      .map((row) => normalized(row.model)),
  );
  // Use the most specific available name, never silently substitute a different
  // engine/region (e.g. 328i for 318i, US GT-R for Skyline, Corolla for Auris).
  const model = mapping.models.find((candidate) => names.has(candidate));
  if (!model) return { ...base, status: "not-listed", reason: "model" };
  const url = new URL("https://api.nhtsa.gov/recalls/recallsByVehicle");
  url.search = new URLSearchParams({
    make,
    model,
    modelYear: String(year),
  }).toString();
  const payload = recallSchema.parse(await sourceJson(url, fetcher));
  const records = new Map<string, OfficialProblemResult["records"][number]>();
  for (const row of payload.results) {
    if (
      Number(row.ModelYear) !== year ||
      normalized(row.Make) !== make ||
      normalized(row.Model) !== model
    )
      continue;
    const previous = records.get(row.NHTSACampaignNumber);
    records.set(row.NHTSACampaignNumber, {
      campaign: row.NHTSACampaignNumber,
      component: row.Component,
      summary: row.Summary,
      consequence: row.Consequence ?? "",
      remedy: row.Remedy ?? "",
      reportedAt: row.ReportReceivedDate ?? "",
      sourceUrl: `https://api.nhtsa.gov/recalls/recallsByCampaignNumber?campaignNumber=${row.NHTSACampaignNumber}`,
      parkIt: Boolean(previous?.parkIt || row.parkIt),
      parkOutside: Boolean(previous?.parkOutside || row.parkOutSide),
    });
  }
  return officialProblemResultSchema.parse({
    ...base,
    status: "available",
    matchedModels: [model],
    records: [...records.values()],
  });
}
