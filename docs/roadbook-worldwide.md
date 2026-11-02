# Worldwide Roadbook additions · 2 November 2026

Added **120 named destinations in 36 countries**, taking the live public catalog from **125 to 245 places across 60 countries**. The batch covers Africa, Asia, Europe, North America, South America and Oceania, with Middle Eastern destinations also recorded separately for coverage review.

| Region        | New places |
| ------------- | ---------: |
| Europe        |         58 |
| North America |         30 |
| Asia          |         12 |
| Oceania       |          7 |
| South America |          5 |
| Africa        |          4 |
| Middle East   |          4 |

The additions contain 110 circuit destinations, eight drag venues, one drift venue and one proving ground. Examples include Circuit of the Americas, Fuji Speedway, Monza, Killarney, Circuit de Dakar Baobabs, Kari Motor Speedway, Lusail and Taupō.

## Evidence and limits

The reviewed manifest is `data/roadbook/worldwide-2026-11-02.json`. Each row has a linked operator page plus a Wikidata entity for coordinate provenance. Structured coordinates and identifiers are [Wikidata CC0 data](https://www.wikidata.org/wiki/Wikidata:Licensing). Operator pages were checked for venue identity, redirects, failed pages and obvious domain takeovers. Page articles and images were not copied. The names and coordinates remain a research snapshot, not guaranteed current directions to an entrance.

Manual review excluded closed and proposed facilities, existing entries, a former operator link redirected to a fleet business, and two obsolete domains now serving gambling material. A successful HTTP response alone was not treated as approval. Montlhéry links to its actual [UTAC operator page](https://www.utac.com/our-sites/linas-montlhery), not a historic fan page. The FIA directory was consulted for context; the import does not claim a current FIA grade or licence.

Entries are marked **official source linked**, with `verified_at` unset. This preserves the existing message that current conditions are not confirmed. Prices, hours, noise limits, lengths, images and routes remain unset. The descriptions explain that the pin is a venue reference, not a driving route or permission to enter a track. Category placement does not assert that a public track day is currently bookable.

## Publication

`supabase/migrations/20261102215121_roadbook_worldwide_destinations.sql` is an atomic, data-only migration. It:

- Inserts new entries without updating or deleting existing venues or user records.
- Checks external ID, slug and a 750 m proximity threshold against existing motorsport venues.
- Uses stable external IDs for replay safety and refuses to commit if the imported batch count differs from the reviewed 120.
- Preserves the existing schema, row-level access policies and public spatial-query limit.

The preflight found zero existing matches. After publication, the original 125-row fingerprint was unchanged (`cee93af7e96ff36f5825cb25be2bbc60`). Public catalog count: 245; new batch count: 120. The manifest is not imported into browser code: the existing distance/category queries fetch only the places needed for the current area. No image assets or client dependencies were added.

## Checks and repeatability

- Four batch tests validate real map-schema compatibility, coverage, stable IDs, coordinate provenance, exclusions and representative hemispheres. Existing count tests also pass.
- Scoped ESLint and TypeScript passed. Anonymous, public-key spatial queries returned destinations in all seven recorded regions.
- The live controls report is in ignored `artifacts/roadbook-controls/`; the QA script reads the actual catalog total instead of assuming the former 125.
- `scripts/qa-roadbook-worldwide.mjs` repeats read-only public count and regional queries using the normal public URL/key.
- `scripts/roadbook-worldwide-selection.json` records the reviewed shortlist, overrides and exclusions. `scripts/research-roadbook-worldwide.mjs` checks operator links without database access. It consumes the ignored Wikidata candidate snapshot under `artifacts/roadbook-worldwide/`; that snapshot was obtained with the public Wikidata SPARQL query service for motorsport tracks with coordinates, country codes and official-site properties, supplemented by the individually cited African and Indian entities.
- `scripts/build-roadbook-worldwide.mjs` regenerates the manifest/migration from that reviewed research only when passed `--write`. It never applies changes to a database. Reapplying an existing migration is unnecessary; future expansions should use a new batch and migration.

The public total is cached in the browser for up to five minutes. Existing tabs may therefore need a refresh before showing the new count. Fuel stations are discovered separately and are excluded from these totals.
