# CapCar AI trip planner

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
