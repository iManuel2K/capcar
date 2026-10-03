# Roadbook fuel discovery

Roadbook uses the Tankerkönig API to show current MTS-K fuel prices near the
visible German map center. The browser calls `/api/roadbook/fuel`; the provider
key stays in the Netlify Function runtime.

Outside Tankerkönig coverage—or when its private key/provider is unavailable—
the same server endpoint returns nearby fuel stations from OpenStreetMap via a
bounded Overpass query. This worldwide directory fallback does not invent
prices or opening status. The drawer labels it as directory data and links to
the OpenStreetMap copyright/ODbL attribution.

## Netlify configuration

Create this secret environment variable with **Functions** and **Runtime**
scope, then redeploy:

```text
TANKERKOENIG_API_KEY
```

Request a personal key at <https://creativecommons.tankerkoenig.de/>. Do not
commit it or expose it through a `NEXT_PUBLIC_` variable.

The endpoint accepts worldwide coordinates and bounds every request to a 25 km
radius and 40 directory results. Netlify's CDN caches normalized live-price
responses for five minutes and directory responses for 15 minutes to respect
provider infrastructure. Provider failure never blocks the venue map.

Fuel data attribution is shown in every station drawer. Drivers must confirm
the displayed price at the pump before filling.
