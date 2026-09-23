# Epic 90 — Netlify Origin Recovery

## Root cause

Connected Parts compared the browser `Origin` header only with
`new URL(request.url).origin`. Behind Netlify's proxy, the request URL seen by
the Next.js runtime can use an internal deployment origin even though the
browser correctly posts from `https://capcar.dev`. Capcar therefore
returned `403` before quota protection or eBay search ran.

## Resolution

Mutation and public-search routes now use one shared origin validator. It
accepts only exact HTTP(S) origins that match one of these server-known URLs:

- the direct request URL;
- `NEXT_PUBLIC_SITE_URL`;
- Netlify `URL`;
- Netlify `DEPLOY_PRIME_URL`;
- Netlify `DEPLOY_URL`.

The validator does not trust arbitrary forwarded-host headers. Missing,
malformed and cross-site origins remain blocked before provider or database
access. Connected Parts, International Parts and authenticated Community
mutations share the correction.

No new environment variable or database migration is required. Keep
`NEXT_PUBLIC_SITE_URL=https://capcar.dev` in the production Netlify
environment.

## Acceptance

After deployment, open `/connected-parts` and search for a part. The network
request to `/api/retail/search` must no longer return `403`. It should return
live results, an eBay provider-specific message, or a rate-limit response.
