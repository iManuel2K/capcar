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

## Generation timeouts and transport

The app requests NDJSON from `/api/ai/trips`. Account, connection and rate-limit
checks retain normal HTTP errors before streaming begins. A progress frame is
sent immediately after those checks and every five seconds while generation is
pending. The final frame carries either the real itinerary or a provider error
with its code and original status. Errors after streaming starts travel in that
frame because HTTP headers have already been sent. Clients without the NDJSON
Accept header retain the buffered JSON contract.

The stream has a 52-second deadline and aborts native provider requests on expiry
or disconnect. Gemini generation and its possible location-repair attempt share
one 45-second budget. This prevents each attempt starting a fresh wait. Slow or
unavailable providers can still return an error; no itinerary is fabricated to
hide a timeout.
