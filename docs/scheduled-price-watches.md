# Scheduled price watches

CapCar keeps the existing browser-side price checks and adds a bounded server path for signed-in users. It does not create orders, monitor arbitrary URLs or claim continuous retailer coverage.

## Flow

1. The Garage syncs enabled watches that point to an exact connected-provider item. Owner-entered quotes without a provider item ID stay local.
2. `price-watch-scout` runs on the published Netlify deploy at minute 17 every six hours and dispatches the protected background function.
3. The worker checks at most 24 due watches per run with concurrency 2. A provider failure uses bounded exponential backoff; a stale provider fallback is never stored as a fresh observation.
4. The latest result is stored under row-level security and imported into the existing local Build Planner workbench on the user's next Garage visit.
5. CapCar marks imported results consumed. Existing price history and notification de-duplication remain authoritative in the workbench.

## Required production setup

- Apply `20261001141619_scheduled_price_watch_results.sql`.
- Configure server-only `SUPABASE_URL`, `SUPABASE_SECRET_KEY` and a unique `PRICE_WATCH_JOB_SECRET` in Netlify.
- Configure a live retailer provider. The eBay application credentials are preferred over a static access token.
- Publish a production deploy. Netlify scheduled functions do not run on previews or local development.

## Boundaries

- Maximum 50 synchronized watches per account and 24 checks per scheduled run.
- Minimum server interval is six hours; repeated failures back off to a maximum of 24 hours.
- A result is useful only if the provider returns the same provider item ID. A similarly named listing is not substituted.
- No email, SMS or push delivery is claimed. The result appears when the user next opens the Garage.
- The server secret and Supabase secret must never use a `NEXT_PUBLIC_` prefix.

## Production monitoring

The dispatcher and background worker write structured Netlify logs. Successful
logs contain only the run status, duration and aggregate counts. They never log
the user ID, search query, provider item ID or the job secret. A worker failure
is rethrown after logging so Netlify marks the invocation as failed instead of
showing a misleading success.

Use the `price_watch_runs` table as the durable operational record:

```sql
select
  status,
  watches_checked,
  results_updated,
  jsonb_array_length(errors) as error_count,
  started_at,
  finished_at
from public.price_watch_runs
order by started_at desc
limit 20;
```

Expected behavior:

- A published deploy runs at minute 17 every six hours in UTC.
- A healthy empty run is `completed` with zero checks and proves the scheduler,
  worker credential and database connection are working.
- `partial` means at least one watch failed while other due watches continued.
- `failed`, a Netlify failed invocation or no row after a protected test call
  requires checking the server-only Supabase URL/key and job-secret scopes.
- A `running` row older than 20 minutes should be investigated as an interrupted
  background invocation; do not silently mark it completed.

After a deploy, verify one empty run before asking a user to create a watch.
Then verify one exact connected offer end to end: subscription sync, due worker
result, owner-only import and `consumed_at` update on the next Garage visit.
