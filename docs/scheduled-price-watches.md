# Scheduled price watches

CapCar keeps the existing browser-side price checks and adds a bounded server path for signed-in users. It does not create orders, monitor arbitrary URLs or claim continuous retailer coverage.

## Flow

1. The Garage syncs enabled watches that point to an exact connected-provider item. Owner-entered quotes without a provider item ID stay local.
2. `price-watch-scout` runs on the published Netlify deploy at minute 17 every six hours and dispatches the protected background function.
3. The worker checks at most 24 due watches per run with concurrency 2. A provider failure uses bounded exponential backoff; a stale provider fallback is never stored as a fresh observation.
4. The latest result is stored under row-level security and imported into the existing local Build Planner workbench on the user's next Garage visit.
5. CapCar marks imported results consumed. Existing price history and notification de-duplication remain authoritative in the workbench.

## Required production setup

- Apply `20260930203000_scheduled_price_watch_results.sql`.
- Configure server-only `SUPABASE_URL`, `SUPABASE_SECRET_KEY` and a unique `PRICE_WATCH_JOB_SECRET` in Netlify.
- Configure a live retailer provider. The eBay application credentials are preferred over a static access token.
- Publish a production deploy. Netlify scheduled functions do not run on previews or local development.

## Boundaries

- Maximum 50 synchronized watches per account and 24 checks per scheduled run.
- Minimum server interval is six hours; repeated failures back off to a maximum of 24 hours.
- A result is useful only if the provider returns the same provider item ID. A similarly named listing is not substituted.
- No email, SMS or push delivery is claimed. The result appears when the user next opens the Garage.
- The server secret and Supabase secret must never use a `NEXT_PUBLIC_` prefix.
