# CapCar AI trip planner

## Short-prompt planning

CapCar owns the trip brief and validation rules while the user's connected AI
generates the itinerary. A shared composer accepts optional text alongside ordered
places. The place picker and a single Settings button stay next to the composer;
vehicle, dates, daily time budget, return preference and connected context live in
Settings. Missing departure information opens Settings and focuses the starting
town before any AI request. Text-only planning needs an explicit starting town;
selected routes use their first place as departure. Common day-trip and relative
date wording suggests editable dates. One-day trips are supported.

For one-day trips with an origin and `GEOAPIFY_API_KEY`, CapCar retrieves up to
30 nearby places within a bounded 10–100 km radius, rejects malformed,
duplicate and out-of-radius records, and supplies up to 12 interest-ranked
candidates to the AI. Discovery failure is disclosed without preventing a draft.
The brief and shortlist are sent to native OpenAI, Gemini and Anthropic
providers; custom external providers receive the request and planning context.

Generated dates must match the brief. CapCar ensures the requested origin is
included in routing and adds the return when requested. Once route calculation
succeeds, prompt-mode plans show an aggregate estimate of driving, visits and
breaks against the daily budget multiplied by the number of days. Calendar
export is disabled when that estimate exceeds the budget. This is not a
per-day feasibility, traffic, opening-hours, parking or access verification.
No preference learning, model training or automatic booking is implemented.

The `/ai` flow has four independent layers so a temporary provider failure does
not remove the whole feature:

1. OpenAI produces a structured, web-grounded itinerary.
2. Geoapify resolves the selected stops to coordinates.
3. OpenRouteService calculates the drivable road geometry between those stops.
4. Leaflet draws that geometry over OpenStreetMap/OpenFreeMap and applies the
   existing nine Roadbook palettes.

The result opens on the map and includes a Map / Detailed plan switch. Google
Maps, Apple Maps, Waze and OpenStreetMap remain explicit hand-offs; CapCar does
not claim to read or compare private routing data from those consumer apps.
Waze has no public route-comparison API.

## Required production services

| Capability                            | Service                               | Environment values                                                                         |
| ------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| AI itinerary and current web research | OpenAI Responses API                  | `CAPCAR_TRIP_PLANNER_MODE=openai`, `OPENAI_API_KEY`, `CAPCAR_TRIP_PLANNER_MODEL`           |
| Reliable place search                 | Geoapify Geocoding                    | `GEOAPIFY_API_KEY`                                                                         |
| Calculated road line                  | OpenRouteService Directions           | `OPENROUTESERVICE_API_KEY`                                                                 |
| Useful stop imagery                   | Unsplash API                          | `UNSPLASH_ACCESS_KEY`                                                                      |
| Calendar and mail metadata            | Google OAuth, Calendar API, Gmail API | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_CONNECTION_ENCRYPTION_KEY` |
| Connection storage                    | Supabase                              | `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, public Supabase variables                           |

OpenStreetMap, OpenFreeMap and Open-Meteo do not require browser API keys in
this implementation. The server falls back to public Nominatim and OSRM demo
endpoints when Geoapify/OpenRouteService are absent; that fallback is suitable
for development and light beta testing, not guaranteed production capacity.

## Netlify deploy contexts

Set secret values in Netlify with secret visibility. The AI, route, image and
Supabase server values can be available in Production, Deploy Previews and
Branch Deploys when those contexts use safe test quotas.

Google OAuth needs special handling because Google requires exact callback
URLs:

- Production: set the Google variables and register
  `https://capcar.dev/api/connections/google/callback`.
- Local development: register `http://localhost:3000/api/connections/google/callback`
  and use localhost values in `.env.local`.
- Deploy previews: leave Google variables unset unless a stable preview domain
  has been registered as an additional Google callback. The rest of the AI map
  continues to work and the connection screen explains that setup is missing.

Example CLI commands:

```bash
netlify env:set CAPCAR_TRIP_PLANNER_MODE "openai" --context production
netlify env:set OPENAI_API_KEY "..." --secret --context production
netlify env:set GEOAPIFY_API_KEY "..." --secret --context production
netlify env:set OPENROUTESERVICE_API_KEY "..." --secret --context production
netlify env:set UNSPLASH_ACCESS_KEY "..." --secret --context production
netlify env:set GOOGLE_OAUTH_CLIENT_ID "..." --secret --context production
netlify env:set GOOGLE_OAUTH_CLIENT_SECRET "..." --secret --context production
netlify env:set GOOGLE_CONNECTION_ENCRYPTION_KEY "..." --secret --context production
```

Repeat the non-Google values with `--context deploy-preview` and any required
`--context branch:<branch-name>` context. Never prefix these secrets with
`NEXT_PUBLIC_`.

## Google setup

Follow `docs/google-connections.md`, enable both the Google Calendar API and
Gmail API, and apply
`supabase/migrations/20261003160033_external_connections.sql`. Gmail metadata
access can require Google verification before accounts outside the OAuth test
user list can connect.

## Honest product boundaries

- The red line is calculated road geometry, not an illustrated curve.
- Map-style names change CapCar's OpenFreeMap vector palette; they are not
  screenshots of Google, Apple or Waze.
- Stop imagery is representative unless a verified source explicitly marks it
  as location-specific. Every Unsplash image retains photographer attribution.
- Blitzer cannot be embedded through a supported public API. CapCar can explain
  that Blitzer should run separately, but must not present fabricated live radar
  data.

## Generation jobs and timeouts

The app sends `Prefer: respond-async` and a UUID `Idempotency-Key` to
`/api/ai/trips`. After account, connection and rate-limit checks for new work,
the route saves a short-lived private job,
dispatches the signed `trip-plan-background` function and returns a job ID with
HTTP 202. The browser polls its authenticated status endpoint through short
requests. It does not keep a long connection open or resubmit generation when
one poll fails. Repeated submissions of the same ID and request return the
existing owner's job before consuming another rate-limit allowance. Reusing an
ID for different input or another owner's job is rejected. The result is
generated using the requesting user's stored AI connection, not a shared user key.

Before submission, the browser stores the ID and request brief under an
account-specific local-storage key. Returning to the planner resumes that ID;
leaving the page cancels polling without cancelling the paid job. An ambiguous
creation response or temporary polling outage keeps the saved request for retry.
Confirmed completion/failure clears it. Local recovery requires browser storage;
no AI keys or connected Google metadata are stored there.

The worker atomically claims queued jobs so repeated delivery cannot start a
second paid generation. It reloads the owner's connection, generates the plan,
and saves completion or a provider failure. Provider keys never enter the job
payload or response. Pending input/context are cleared on completion/failure;
expired jobs are removed when new jobs start. The table is service-only with RLS;
status lookups additionally match the signed-in owner and expiry. Jobs expire
after one hour. After three minutes, polling or a repeated worker delivery
conditionally persists a terminal timeout and clears pending input/context.
Claims and completion writes also enforce that deadline, so late work cannot
start or overwrite a terminal failure. Unacknowledged dispatches remain queued;
status polling retries signed delivery at most once per 15 seconds.

The worker retries result persistence separately from generation (three bounded
writes), so a transient database failure neither discards a completed result nor
starts another paid call. A crash after claim or a persistent database outage is
reconciled to a terminal failure; CapCar never automatically repeats an unknown
paid generation. The owner can explicitly start a new request after that failure.

Gemini background generation and its possible location repair share a two-minute
budget. Worker requests are cancelled within 125 seconds, shortened when needed
to reserve time for saving before the job deadline. Buffered JSON and earlier
NDJSON clients remain compatible, but the current app uses background jobs to
avoid the deployment's observed 30-second connection limit.

Apply `20261027144842_harden_trip_job_recovery.sql` before deploying this change.
It adds nullable request-hash and dispatch-time fields without changing access
policies. Old clients without an idempotency key remain compatible. To roll back,
restore the previous application and leave the additive columns in place.
