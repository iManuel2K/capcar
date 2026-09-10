# Epic 87 — Garage and parts-search refinement

Install after Epic 86. Source was recovered from the original uploaded project and saved Epic packages. It is not a verified latest GitHub checkout. The installer stops before writing if local files differ from this baseline. Keep local changes and merge any conflict.

## Shipped

- ResilientPartSearch: 500 ms debounce, query/market/destination isolation, abort on supersession/unmount, 25-second browser timeout, 30-second bounded session cache, reduced-motion skeletons, accessible feedback, explicit retry and real empty states. IME composition does not trigger premature searches. No empty query requests. Successful responses are schema-checked and retailer URLs allowlisted.
- Connected Parts uses this component and preserves vehicle wishlist saving and pagination. No automatic retry loops consume provider quota.
- The older international-search endpoint now uses the same anonymous database allowance and same-origin check as Connected Parts. This fixes the remaining sign-in contradiction in recovered source. It does not establish why your current deployment fails without its request/error logs.
- FitmentCard: green Direct Bolt-On, amber Requires Modification, red Incompatible and neutral Fitment Unverified; text and icons communicate status independently of colour. Current demo catalogue results remain unverified. A positive claim requires evidence supplied by the application; displaying a source is not itself verification.
- GarageOverviewGrid is connected to each existing vehicle card through VehicleOverviewSummary. It uses real build and service records, distinguishes planned cost from actual spending, displays overspend explicitly, and prioritizes overdue/soon tasks before unknown history. When several tasks share a category, the next recorded date then mileage determines their order; this is a useful queue, not a manufacturer service schedule.
- The Concept Studio copy leads with exploration, while keeping browser-only saving, supported controls and reference-model limitations accurate. A structured cream/petrol footer replaces the homepage's crowded link row and is reused on Studio, Sound Studio and community pages.
- Netlify badge remains controlled by your already-disabled Netlify setting. No code tries to hide it.

## Installation / deployment

No dependency or new database migration is included. Both public retailer routes require the successful Epic 86 `consume_public_retail_budget()` migration. Its earlier community migration must already exist. Do not blindly rerun partially applied SQL or delete existing tables.

Existing server environment names: `CAPCAR_EBAY_CLIENT_ID`, `CAPCAR_EBAY_CLIENT_SECRET`, optional `CAPCAR_EBAY_ACCESS_TOKEN` for Connected Parts, optional `CAPCAR_EBAY_CAMPAIGN_ID`. The recovered legacy international provider requires `CAPCAR_EBAY_MODE=live`; otherwise it returns explicitly labelled demo results. Production eBay access is still required. These variables must never use a `NEXT_PUBLIC_` prefix. Supabase uses the existing public URL and publishable key; no service-role key is required by this change.

## Targeted search diagnosis

1. Browser DevTools → Network: inspect the failed request URL, method, status, JSON body and response. `/api/retail/search` expects `{query,market,destination,page}`. `/api/international-search` expects `{query,region,destination,postcode,condition}`. They are not interchangeable; one supports retailer markets and pagination, the other regional/postcode filtering.
2. 401: verify the production deployment contains the anonymous guard change, rather than an older authenticated route. 403: verify the request Origin matches the served site's origin. Keep secrets on the server.
3. 400: check trimmed query length, supported country codes, integer page 0–9, postcode format, JSON Content-Type and actual body. Normalize at the schema boundary; never interpolate user text into SQL or Supabase filter expressions. Use bound parameters/RPC arguments and URLSearchParams for retailer queries.
4. 429: shared quota was exhausted. Debounce/cache reduces repeated calls; do not add automatic retries that make exhaustion worse. The database limits protect all instances together, not each visitor separately.
5. 503: confirm the two required migrations completed in the intended Supabase project, then check server credentials, eBay production API approval and provider quota. Copy only status/error codes from Netlify logs, never tokens or authorization headers.
6. 504, HTML or JSON parse errors: compare Netlify function logs and upstream durations. The recovered retailer provider permits 10 seconds for OAuth plus 12 seconds for search; the browser times out after 25 seconds. A platform timeout can be shorter. The new client handles non-JSON failures but cannot repair unavailable upstream services.
7. React: event handlers/hooks belong behind `use client`; providers and secrets stay inside server routes. Never mutate state in place. Abort the previous request, key results by all filters, and ignore late responses. Strict Mode's development rerun must clean up timers and requests. Do not add a second fetching effect around ResilientPartSearch.

## Fitment architecture

Use normalized, versioned application rules: `parts`, `vehicle_variants`, `fitment_rules`, `fitment_constraints`, `fitment_evidence`, `fitment_assessments`. Store OE references in their own table and index `(manufacturer, normalized_part_number)`; index vehicle variants by `(make, platform, engine_code, production_month)`.

Each rule references one part and a constrained variant scope. Engine codes match exactly (`N43B20`), while engine-family matching must be explicit (`N43`). A substring/prefix match must not silently confer compatibility. Include body style, production month boundaries, gearbox, drive layout, option codes and part-specific dimensions. Exhaust rules also need flange/pipe dimensions, catalyst/sensor provisions and mounting constraints. Keep road approval separate from mechanical fitment.

```ts
type FitmentRule = {
  id: string;
  partId: string;
  revision: number;
  scope: {
    platform: string;
    engine: { kind: "exact" | "family"; code: string };
    productionFrom: string; // YYYY-MM, inclusive
    productionTo: string | null;
    bodyStyles: string[];
    transmissions: string[];
    requiredOptionCodes: string[];
  };
  constraints: Array<{
    key: string; // e.g. exhaust.inletDiameterMm
    operator: "eq" | "range" | "includes";
    values: Array<string | number>;
  }>;
  outcome: "bolt-on" | "modification" | "incompatible";
  requiredWork: string[];
  evidenceId: string;
  approval: { market: string; status: "approved" | "restricted" | "unknown" };
};
```

Evaluate exact exclusions first; evaluate all required facts inside a candidate rule with AND and alternative complete rules with OR. Return Unverified when a required fact/evidence is missing, stale, or contradictory. Return Requires Modification only for a documented compatible conversion with explicit work, not just because some data is unknown. Persist the rule revision, vehicle facts and evidence version behind each assessment. The schema above is a proposed next model, not a migrated production table or a claim that every N43B20 exhaust fits an E90.

## Self-audit and limits

The code uses typed props, existing storage hooks, bounded requests/cache, URL validation, accessible labels/statuses, non-colour-only fitment cues and responsive grids. The search module follows React effect cleanup guidance: https://react.dev/reference/react/useEffect. The server route uses Next route handlers: https://nextjs.org/docs/app/api-reference/file-conventions/route.

These changes improve interaction quality but cannot justify 9.5/10 without real desktop/mobile and authenticated user testing. Final delivery lists actual checks. Production eBay/Supabase connectivity and your specific live error remain unverified. Published listing inventory, licensed exact configurable 3D vehicles and additional audio assets are outside this package.
