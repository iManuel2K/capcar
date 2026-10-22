const base = new URL(process.argv[2] ?? "http://localhost:3109");
if (!["http:", "https:"].includes(base.protocol))
  throw new Error("Provide an HTTP or HTTPS deployment URL.");

const routes = [
  "/api/catalog/search",
  "/api/offers/search",
  "/api/vehicle-data/resolve",
  "/api/copilot/chat",
  "/api/ai/trips/route-map",
];
let failures = 0;

// These probes must be rejected before any provider operation or mutation.
for (const route of routes) {
  for (const [label, origin, statuses] of [
    ["cross-site origin", "https://untrusted.example", [403]],
    ["missing origin", null, [403]],
    ["signed-out same-site request", base.origin, [401, 503]],
  ]) {
    try {
      const response = await fetch(new URL(route, base), {
        method: "POST",
        redirect: "manual",
        headers: {
          "content-type": "application/json",
          ...(origin ? { origin } : {}),
        },
        body: "{}",
        signal: AbortSignal.timeout(10_000),
      });
      const passed =
        statuses.includes(response.status) &&
        response.headers.get("cache-control")?.includes("no-store");
      await response.body?.cancel();
      if (!passed) {
        failures++;
        console.error(`FAIL ${route}: ${label} (HTTP ${response.status})`);
      } else {
        console.log(`PASS ${route}: ${label} (HTTP ${response.status})`);
      }
    } catch {
      failures++;
      console.error(`FAIL ${route}: ${label} (request unavailable)`);
    }
  }
}

if (failures) {
  console.error(`Security smoke failed: ${failures} check(s).`);
  process.exitCode = 1;
} else {
  console.log("Security smoke passed: all 15 requests denied with no-store.");
}
