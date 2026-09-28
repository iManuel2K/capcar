export const SCOUT_SHARD_COUNT = 4;

export type ScoutScope = "global_major" | "europe";
export type ScoutSourceKind = "event_page" | "place_page";
export type ScoutCandidateKind = "event" | "place" | "image";

export type ScoutSource = {
  key: string;
  kind: ScoutSourceKind;
  scope: ScoutScope;
  name: string;
  url: string;
  countryCode: string;
};

export type PhotoTarget = {
  key: string;
  countryCode: string;
  region: string;
  latitude: number;
  longitude: number;
  query: string;
};

export type DiscoveryCandidate = {
  kind: ScoutCandidateKind;
  fingerprint: string;
  sourceKey: string;
  title: string;
  sourceUrl: string;
  countryCode?: string;
  region?: string;
  confidence: number;
  payload: Record<string, unknown>;
};

export type ScoutRunSummary = {
  shard: number;
  sourcesChecked: number;
  photosChecked: number;
  candidatesFound: number;
  skipped: string[];
  errors: string[];
};
