# Roadbook live fuel prices

Roadbook uses the Tankerkönig API to show current MTS-K fuel prices near the
visible German map center. The browser calls `/api/roadbook/fuel`; the provider
key stays in the Netlify Function runtime.

## Netlify configuration

Create this secret environment variable with **Functions** and **Runtime**
scope, then redeploy:

```text
TANKERKOENIG_API_KEY
```

Request a personal key at <https://creativecommons.tankerkoenig.de/>. Do not
commit it or expose it through a `NEXT_PUBLIC_` variable.

The endpoint bounds requests to Germany and a maximum 25 km radius. Netlify's
CDN caches normalized responses for five minutes with a 15-minute stale window
to limit provider traffic. Provider failure never blocks the venue map.

Fuel data attribution is shown in every station drawer. Drivers must confirm
the displayed price at the pump before filling.
