# Roadbook Scout

Roadbook Scout is CapCar's server-only discovery pipeline. Four Netlify
Scheduled Functions run every Monday at 01:00, 03:00, 05:00 and 07:00 UTC.
Together they monitor the complete curated catalog once per week:

- major official automotive venues worldwide;
- major and smaller official European venues;
- official scenic-route sources;
- 100 geographically distinct European Unsplash searches.

The jobs only create private moderation candidates. They never publish a venue,
event or image to the public Roadbook.

## Required Netlify environment variables

Configure these for the Functions scope. Do not use `NEXT_PUBLIC_` names.

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
UNSPLASH_ACCESS_KEY
ROADBOOK_SCOUT_SECRET
```

`SUPABASE_SERVICE_ROLE_KEY` remains supported as a legacy fallback, but the
modern server secret key is preferred. `ROADBOOK_SCOUT_SECRET` authorizes a
deliberate manual rerun through the `x-roadbook-scout-secret` request header.
Normal scheduled invocations are protected from repeated execution by a
database-backed six-day run guard.

If `UNSPLASH_ACCESS_KEY` is absent, official-source discovery still runs and
the image stage reports a clear skip. The key is never sent to the browser.

## Unsplash behavior

Each shard performs 25 searches, keeping the default API usage below 50
requests per hour. Jobs are separated by two hours. The returned CDN URL is
hotlinked, and each candidate retains:

- Unsplash photo ID;
- photographer name and attributed profile URL;
- Unsplash source URL;
- `download_location` for the future approval action;
- the exact search target and approximate coordinates;
- an explicit `representative` context label.

Selecting an image for publication must call its stored Unsplash
`download_location` first. Discovery does not call it because candidates have
not yet been selected for public use.

The private image queue is capped at 150 pending candidates. This prevents an
unreviewed queue from growing by 100 records every week. Searches resume as
candidates are approved or rejected.

## Source policy

The crawler identifies itself as `CapCarRoadbookScout/1.0`, checks
`robots.txt`, follows conditional request headers, limits responses to 2 MB and
times out individual requests after six seconds. It extracts only dated
Schema.org event data and explicit place structured data. It does not scrape
Google Maps, social networks, authenticated pages or community ratings.

OpenStreetMap is not bulk queried by this job. Coordinates in image targets are
curated context for geographic distribution, not automatically published
venue coordinates.

## Moderation and operations

The migration creates:

- `roadbook_scout_sources` for source health and conditional-request state;
- `roadbook_discovery_candidates` for pending event, place and image records;
- `roadbook_ingestion_runs` for bounded run summaries and errors;
- `moderate_roadbook_discovery_candidate(...)` for moderator decisions.

Authenticated moderators may read candidates and mark them approved or
rejected through the RPC. Approval records a decision; it intentionally does
not publish unverified data automatically.
