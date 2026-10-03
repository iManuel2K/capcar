import {
  isTankerkonigCoverage,
  normalizeOverpassResponse,
  normalizeTankerkonigResponse,
  overpassFuelQuery,
  parseRoadbookFuelQuery,
  tankerkoenigUrl,
} from "./_shared/roadbook-fuel";

function responseHeaders(maxAge: number) {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Netlify-CDN-Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=1800`,
  };
}

export default async function roadbookFuel(request: Request) {
  if (request.method !== "GET")
    return Response.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405 });

  const query = parseRoadbookFuelQuery(new URL(request.url));
  if (!query.success)
    return Response.json({ error: "INVALID_SEARCH" }, { status: 400 });

  const apiKey = process.env.TANKERKOENIG_API_KEY?.trim();
  if (apiKey && isTankerkonigCoverage(query.data)) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(tankerkoenigUrl(query.data, apiKey), {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (response.ok) {
        const stations = normalizeTankerkonigResponse(await response.json());
        return new Response(
          JSON.stringify({
            stations,
            fetchedAt: new Date().toISOString(),
            provider: "Tankerkönig / MTS-K",
            pricing: "live",
          }),
          { status: 200, headers: responseHeaders(300) },
        );
      }
    } catch {
      // Tankerkönig can report rejected requests with HTTP 200 and `ok: false`.
      // Keep Roadbook useful by trying the OSM directory next.
    } finally {
      clearTimeout(timeout);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": "CapCarRoadbook/1.0 (https://capcar.dev)",
      },
      body: new URLSearchParams({ data: overpassFuelQuery(query.data) }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("OVERPASS_UNAVAILABLE");
    const stations = normalizeOverpassResponse(
      await response.json(),
      query.data,
    );
    return new Response(
      JSON.stringify({
        stations,
        fetchedAt: new Date().toISOString(),
        provider: "OpenStreetMap",
        pricing: "directory",
      }),
      { status: 200, headers: responseHeaders(900) },
    );
  } catch {
    return Response.json({ error: "FUEL_DATA_UNAVAILABLE" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

export const config = {
  path: "/api/roadbook/fuel",
};
