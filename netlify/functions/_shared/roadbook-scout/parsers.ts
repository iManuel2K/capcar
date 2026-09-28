import { stableFingerprint } from "./hash";
import type { DiscoveryCandidate, ScoutSource } from "./types";

type JsonLdNode = Record<string, unknown>;

const EVENT_TYPES = new Set(["Event", "SportsEvent", "Festival"]);
const PLACE_TYPES = new Set([
  "Place",
  "TouristAttraction",
  "LandmarksOrHistoricalBuildings",
]);

function decodeJsonText(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .trim();
}

function flattenJsonLd(value: unknown): JsonLdNode[] {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (!value || typeof value !== "object") return [];
  const node = value as JsonLdNode;
  const graph = flattenJsonLd(node["@graph"]);
  return [node, ...graph];
}

function extractJsonLd(html: string) {
  const scripts = html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  const nodes: JsonLdNode[] = [];

  for (const match of scripts) {
    try {
      nodes.push(...flattenJsonLd(JSON.parse(decodeJsonText(match[1]))));
    } catch {
      // Broken structured data from one script must not discard valid scripts.
    }
  }

  return nodes;
}

function text(value: unknown, maxLength = 1_200) {
  if (typeof value !== "string") return undefined;
  const normalized = value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

function types(value: unknown) {
  const values = Array.isArray(value) ? value : [value];
  return values.filter((item): item is string => typeof item === "string");
}

function absoluteUrl(value: unknown, sourceUrl: string) {
  const candidate = text(value, 2_000);
  if (!candidate) return sourceUrl;
  try {
    const parsed = new URL(candidate, sourceUrl);
    return parsed.protocol === "https:" ? parsed.toString() : sourceUrl;
  } catch {
    return sourceUrl;
  }
}

function nestedName(value: unknown) {
  if (typeof value === "string") return text(value, 200);
  if (!value || typeof value !== "object") return undefined;
  return text((value as JsonLdNode).name, 200);
}

function nestedAddress(value: unknown) {
  if (typeof value === "string") return text(value, 300);
  if (!value || typeof value !== "object") return undefined;
  const address = value as JsonLdNode;
  return [address.streetAddress, address.addressLocality, address.addressRegion]
    .map((part) => text(part, 120))
    .filter(Boolean)
    .join(", ");
}

function validDate(value: unknown) {
  const date = text(value, 80);
  return date && Number.isFinite(Date.parse(date)) ? date : undefined;
}

export async function structuredDataCandidates(
  html: string,
  source: ScoutSource,
) {
  const candidates: DiscoveryCandidate[] = [];

  for (const node of extractJsonLd(html)) {
    const nodeTypes = types(node["@type"]);
    const title = text(node.name, 200);
    if (!title) continue;

    if (nodeTypes.some((type) => EVENT_TYPES.has(type))) {
      const startsAt = validDate(node.startDate);
      if (!startsAt) continue;
      const sourceUrl = absoluteUrl(node.url, source.url);
      const venueName = nestedName(node.location);
      const fingerprint = await stableFingerprint(
        "event",
        title,
        startsAt,
        venueName ?? source.name,
      );

      candidates.push({
        kind: "event",
        fingerprint,
        sourceKey: source.key,
        title,
        sourceUrl,
        countryCode: source.countryCode,
        confidence: venueName ? 0.85 : 0.72,
        payload: {
          title,
          description: text(node.description),
          startsAt,
          endsAt: validDate(node.endDate),
          venueName,
          address:
            node.location && typeof node.location === "object"
              ? nestedAddress((node.location as JsonLdNode).address)
              : undefined,
          eventStatus: text(node.eventStatus, 160),
          attendanceMode: text(node.eventAttendanceMode, 160),
          image: Array.isArray(node.image) ? node.image[0] : node.image,
          sourceType: nodeTypes,
        },
      });
      continue;
    }

    if (
      source.kind === "place_page" &&
      nodeTypes.some((type) => PLACE_TYPES.has(type))
    ) {
      const sourceUrl = absoluteUrl(node.url, source.url);
      const fingerprint = await stableFingerprint("place", title, sourceUrl);
      candidates.push({
        kind: "place",
        fingerprint,
        sourceKey: source.key,
        title,
        sourceUrl,
        countryCode: source.countryCode,
        confidence: 0.7,
        payload: {
          title,
          description: text(node.description),
          address: nestedAddress(node.address),
          image: Array.isArray(node.image) ? node.image[0] : node.image,
          sourceType: nodeTypes,
        },
      });
    }
  }

  return candidates;
}
