import { unstable_cache } from "next/cache";
import {
  fetchOfficialProblems,
  PROBLEM_CACHE_SECONDS,
} from "./official-records-provider";
import type { OfficialProblemResult } from "./official-records-schema";

// Cache Components is not enabled in this app. Use the supported Next Data
// Cache rather than changing the entire application's rendering architecture.
const cached = unstable_cache(
  fetchOfficialProblems,
  ["problem-records-nhtsa-v1"],
  { revalidate: PROBLEM_CACHE_SECONDS, tags: ["official-problem-records"] },
);
const pending = new Map<string, Promise<OfficialProblemResult>>();
export function getOfficialProblems(profile: string, year: number) {
  const key = `${profile}:${year}`;
  const existing = pending.get(key);
  if (existing) return existing;
  const request = cached(profile, year).finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}
