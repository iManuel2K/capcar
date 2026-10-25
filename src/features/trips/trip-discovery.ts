import type { TripPlannerRequest } from "./trip-planner";

export type PlaceCandidate = {
  id: string;
  name: string;
  mapQuery: string;
  latitude: number;
  longitude: number;
  categories: string[];
  reason: string;
};
export type PlaceDiscovery = {
  status: "available" | "unavailable" | "not_requested";
  candidates: PlaceCandidate[];
};

/** Bounded retrieval. Place existence is not evidence of opening hours, parking or legal access. */
export async function discoverTripPlaces(
  request: TripPlannerRequest,
  environment: Record<string, string | undefined>,
): Promise<PlaceDiscovery> {
  if (!request.origin || request.duration !== 1)
    return { status: "not_requested", candidates: [] };
  const apiKey = environment.GEOAPIFY_API_KEY;
  if (!apiKey) return { status: "unavailable", candidates: [] };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const geocode = new URL("https://api.geoapify.com/v1/geocode/search");
    geocode.searchParams.set("text", request.origin);
    geocode.searchParams.set("limit", "1");
    geocode.searchParams.set("apiKey", apiKey);
    const response = await fetch(geocode, { signal: controller.signal });
    if (!response.ok) throw new Error("Discovery unavailable");
    const geo = await response.json();
    const [lon, lat] = geo.features?.[0]?.geometry?.coordinates ?? [];
    if (
      !Number.isFinite(lon) ||
      !Number.isFinite(lat) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180
    )
      throw new Error("Unresolved origin");
    const categories = new Set(["tourism.attraction", "tourism.sights"]);
    if (
      request.interests.includes("nature") ||
      request.interests.includes("photography")
    )
      categories.add("tourism.sights.viewpoint");
    if (request.interests.includes("food"))
      categories.add("catering.restaurant");
    if (request.interests.includes("culture"))
      categories.add("entertainment.museum");
    const radius =
      Math.min(100, Math.max(10, (request.hoursPerDay ?? 6) * 10)) * 1000;
    const url = new URL("https://api.geoapify.com/v2/places");
    url.searchParams.set("categories", [...categories].join(","));
    url.searchParams.set("filter", `circle:${lon},${lat},${radius}`);
    url.searchParams.set("bias", `proximity:${lon},${lat}`);
    url.searchParams.set("limit", "30");
    url.searchParams.set("apiKey", apiKey);
    const places = await fetch(url, { signal: controller.signal });
    if (!places.ok) throw new Error("Discovery unavailable");
    const body = await places.json();
    const seen = new Set<string>();
    const candidates: PlaceCandidate[] = [];
    for (const feature of (Array.isArray(body.features)
      ? body.features
      : []
    ).slice(0, 30)) {
      const p = feature.properties ?? {};
      const [longitude, latitude] = feature.geometry?.coordinates ?? [];
      if (
        !p.name ||
        !p.place_id ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        Math.abs(latitude) > 90 ||
        Math.abs(longitude) > 180 ||
        seen.has(p.place_id)
      )
        continue;
      const radians = (v: number) => (v * Math.PI) / 180;
      const a =
        Math.sin(radians(latitude - lat) / 2) ** 2 +
        Math.cos(radians(lat)) *
          Math.cos(radians(latitude)) *
          Math.sin(radians(longitude - lon) / 2) ** 2;
      const distanceMeters =
        6371000 *
        2 *
        Math.atan2(Math.sqrt(Math.min(1, a)), Math.sqrt(Math.max(0, 1 - a)));
      if (distanceMeters > radius) continue;
      seen.add(p.place_id);
      candidates.push({
        id: String(p.place_id).slice(0, 300),
        name: String(p.name).slice(0, 120),
        mapQuery: String(
          p.formatted || `${p.name}, ${p.city || p.county || request.origin}`,
        ).slice(0, 180),
        latitude,
        longitude,
        categories: Array.isArray(p.categories)
          ? p.categories
              .filter((c: unknown) => typeof c === "string")
              .slice(0, 8)
          : [],
        reason:
          "Nearby place found for your available time and requested interests; access and opening hours still need checking.",
      });
    }
    const relevance = (candidate: PlaceCandidate) =>
      request.interests.reduce(
        (score, interest) =>
          score +
          (candidate.categories.some((category) =>
            interest === "food"
              ? category.startsWith("catering.")
              : interest === "culture"
                ? category.startsWith("entertainment.museum") ||
                  category.startsWith("tourism.sights")
                : interest === "nature" || interest === "photography"
                  ? category.includes("viewpoint") ||
                    category.startsWith("natural.")
                  : category.startsWith("tourism."),
          )
            ? 1
            : 0),
        0,
      );
    candidates.sort((a, b) => relevance(b) - relevance(a));
    return { status: "available", candidates: candidates.slice(0, 12) };
  } catch {
    return { status: "unavailable", candidates: [] };
  } finally {
    clearTimeout(timer);
  }
}
