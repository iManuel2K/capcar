import {
  normalizeTankerkonigResponse,
  parseRoadbookFuelQuery,
  tankerkoenigUrl,
} from "./_shared/roadbook-fuel";

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Netlify-CDN-Cache-Control":
    "public, s-maxage=300, stale-while-revalidate=900",
};

export default async function roadbookFuel(request: Request) {
  if (request.method !== "GET")
    return Response.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405 });

  const query = parseRoadbookFuelQuery(new URL(request.url));
  if (!query.success)
    return Response.json({ error: "INVALID_SEARCH" }, { status: 400 });

  const apiKey = process.env.TANKERKOENIG_API_KEY?.trim();
  if (!apiKey)
    return Response.json(
      { error: "FUEL_DATA_NOT_CONFIGURED" },
      { status: 503 },
    );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(tankerkoenigUrl(query.data, apiKey), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("TANKERKOENIG_UNAVAILABLE");
    const stations = normalizeTankerkonigResponse(await response.json());
    return new Response(
      JSON.stringify({
        stations,
        fetchedAt: new Date().toISOString(),
        provider: "Tankerkönig / MTS-K",
      }),
      { status: 200, headers: responseHeaders },
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
