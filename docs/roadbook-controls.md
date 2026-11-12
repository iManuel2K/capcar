# Roadbook controls and place counts

The map-style selector is always visible, with nine labeled Lucide icons instead of a disclosure/dropdown. Phones use a horizontally scrollable rail. Selection, keyboard arrows/Home/End, the saved style, deep links, compatibility mode and reduced-motion behavior are preserved. A single responsive picker replaces the two desktop/mobile copies. Its controls use the existing Obsidian Chrome tokens.

The search panel distinguishes the total published catalog from the loaded, filtered area. The area query is distance-based and capped at 250 results; it is not a global total or an exact viewport-boundary count. Search and category filters affect the area count only.

`fetchRoadbookCatalogCount` requests an exact, header-only count of published `roadbook_venues`, using the existing public client and row-level policies. It caches successful totals for five minutes. Failure leaves the total hidden rather than inventing zero, and does not block the map. No venue records, private visits or account data are downloaded for this count. No schema or production data was changed.

## Catalog checked on 2 November 2026

Read-only production queries found **125 published places across 44 countries**. The initial query centered at 50.1, 10.4 with a 2,500 km radius returned **121**.

| Category            | Published places |
| ------------------- | ---------------: |
| Scenic routes       |              102 |
| Car photo spots     |               11 |
| Track-day venues    |                7 |
| Acceleration venues |                2 |
| Proving grounds     |                2 |
| Drift circuits      |                1 |

These are a dated catalog snapshot, not hard-coded UI totals, visitor numbers or a claim that each venue has professional verification. Fuel stations are discovered separately on demand and are excluded from the catalog total.

## Verification

- 25 focused tests: style selection, keyboard navigation, translated totals, existing imagery, count caching/failure and map styles.
- Scoped ESLint, TypeScript and the production build passed.
- Rendered browser checks at 320, 375, 414, 768, 1024 and 1440 pixels; all five locales on mobile; normal and reduced motion; no page scroll jump during keyboard style changes; real public counts; filtering; mobile zoom/fuel spacing; no browser errors.
- Run `node scripts/qa-roadbook-controls.mjs` against the configured local preview on port 3127. It needs Playwright and Edge; `PLAYWRIGHT_MODULE` and `ROADBOOK_PREVIEW_URL` can override their defaults. Reports/screenshots go to ignored `artifacts/roadbook-controls/`.

Checks used browser emulation, not physical phones. Catalog totals can be up to five minutes old, and static counts in this note should not be reused as live data.
