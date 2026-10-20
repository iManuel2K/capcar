# Known-problem sources and on-demand recall references

## What this implements

Every one of the 31 selectable catalog entries has an explicit source policy in `src/features/problems/source-profiles.ts`. The existing reviewed ADAC/HELLA inspection and technical-bulletin summaries remain separate from live official US recall references. A recall is not presented as a diagnosed fault, failure probability, or an open recall on the owner's car.

`GET /api/problems?profile=<catalog-id>&year=<model-year>` accepts only a catalog ID and an in-range four-digit year. It does not accept VIN, plates, vehicle IDs, free-text URLs, names, engine details or arbitrary models. The client omits cookies. Credentialed responses are not CDN-cacheable, preventing a middleware session-refresh header from entering a shared cache.

The server first queries NHTSA's official make/year model index. Only an exact match to a configured model-name candidate is queried for recalls. It validates the source JSON, filters returned rows by make/model/year, deduplicates campaign IDs and retains original summaries, consequences, remedies and urgent park/do-not-drive warnings. It never uses an LLM to manufacture or paraphrase a problem.

Source: https://www.nhtsa.gov/nhtsa-datasets-and-apis (official recall API documentation); https://api.nhtsa.gov/ (API use policy). Individual cards link to the original campaign API record. Official KBA and NHTSA recall searches remain available for exact-vehicle checks.

## Important coverage limits

This is NOT a complete worldwide common-fault database. NHTSA covers the US market, not every European or Japanese specification. Names, model years, engines, production dates and recall completion can differ. The year selector starts with the owner's production year but explicitly asks the owner to confirm the US model year.

European 318i/320i/Auris and Japanese Civic SiR/NSX/Skyline/Silvia/Trueno are not silently substituted with US counterparts. The Z Proto is a concept and receives no production-fault claims. The W198 300 SL has no configured reviewed live source. These entries show an honest coverage gap and official search links, plus any existing reviewed summaries that actually match. Unsupported entries do not claim that a remote source was checked; they have no fabricated retrieval date.

Broader catalog choices such as G-Class, MINI and 911 may return a US source-family reference. The exact source model is displayed; the UI explicitly does not establish applicability to the owner's engine or market. Some years are conservatively excluded where a catalog generation does not align with US model years. Missing records never mean the vehicle is fault-free.

Adding worldwide common faults requires additional reviewed, permissioned sources or a licensed provider. Do not scrape arbitrary workshop/forum pages on each request, republish entire reports, infer frequency from complaint counts, or use another model's issues to hide a coverage gap. Source links alone do not grant redistribution rights.

## Caching, storage and failures

- Persistent Next Data Cache: six hours, keyed by catalog ID/year and source version. Validated results only; exceptions are not stored as empty success. Next's cache can retain previous successful data during failed revalidation; the UI shows the actual retrieval time and a stale warning.
- Concurrent identical cold requests share one promise per server instance.
- Netlify CDN: public non-credentialed GET results, durable one-hour cache plus one-hour stale-while-revalidate; `Netlify-Vary: query=profile|year`. Results are the same for every visitor and contain no private garage data. Cache tag `official-problem-records`; deploy changes invalidate normally.
- Browser: five-minute HTTP cache and a bounded in-memory map (64 lookups). No localStorage/IndexedDB writes, per-car snapshot copies, full external reports or images.
- Source calls: fixed HTTPS official hostname, redirects disabled, eight-second timeout, JSON validation, one-megabyte body limit. No API keys or new dependencies required.
- Outages return 503/no-store with Retry-After, not “no problems”. Reviewed summaries remain visible. Zero-result, unsupported and source-error states are distinct.

The small existing reviewed summaries total roughly 13 KB of source text and are deliberately retained for immediate value and outage resilience. The goal is to avoid downloading a growing global dataset or duplicating it for every owner, not to remove a useful tiny fallback.

## Verification

Verified locally: production build, TypeScript and changed-file lint passed. The full regression suite passed 646 tests; the final focused source/UI/API suite passed 22 tests, including an additional cross-generation boundary case. The browser harness passed all five languages, 320px/390px mobile, desktop, keyboard disclosure controls, stale/error/unsupported states and reviewed fallback during an outage. A real NHTSA Mazda3 lookup returned four campaign records; repeating the request reused its retrieval timestamp (warm local requests around 22–27 ms). These local timings are not a production performance guarantee.

Run `scripts/qa-known-problems.mjs` with Playwright available (`PLAYWRIGHT_MODULE` may point to the bundled runtime). It launches and cleans up its own isolated local dev server with account services disabled, writes only local fixtures and ignored screenshots/reports under `artifacts/known-problems`, and never contacts production user data. The harness performs one real model/year lookup, not a bulk vehicle/VIN scan. Increment the source-cache version when changing mapping semantics or result schema.

Unit/API tests cover all 31 mappings, generation/market mismatches, exact source-index matching, raw source text, urgent flags, duplicate campaigns, invalid/oversized input, outages, six-hour cache configuration, request coalescing, privacy, model-year selection, stale/error/empty/prototype states and five-language UI labels. Rendered checks must cover desktop/mobile and switching cars; local tests cannot prove Netlify CDN hits. After a user-authorized deployment, inspect `Cache-Status` on the public endpoint to verify edge/durable caching. No deployment or database migration is part of this change.
