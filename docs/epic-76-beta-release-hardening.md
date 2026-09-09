# Epic 76 — Beta release hardening and acceptance

Epic 76 closes the beta engineering loop without adding another product surface. It makes deployment configuration fail clearly, preserves versioned environment templates, expands production smoke coverage and aligns root recovery states with Capcar's OEM+ interface.

## Release gates

1. `pnpm.cmd preflight:production` passes with the intended Netlify production variables loaded.
2. Formatting, lint, strict TypeScript, Vitest and the production build pass locally.
3. The Netlify deployment completes from the repository's tracked production branch.
4. `pnpm.cmd smoke:production -- https://capcar-im.netlify.app` passes, including readiness, metadata routes, security headers and the missing-Passport 404.
5. The manual acceptance journeys in `BETA-LAUNCH.md` are recorded against the deployed commit.

## Configuration policy

- `.env.example` and the named example templates are intentionally tracked.
- Real `.env` files remain ignored.
- Supabase publishable credentials may be browser-visible; secret and service-role credentials may not.
- eBay App ID and Cert ID remain server-only under `CAPCAR_EBAY_CLIENT_ID` and `CAPCAR_EBAY_CLIENT_SECRET`.
- Selecting a live provider without its complete server configuration blocks deployment readiness instead of silently substituting demo data.

## Recovery behavior

- Route loading exposes an accessible busy state and respects reduced-motion preferences.
- A root rendering failure offers retry and home actions without claiming that user data was deleted.
- Readiness and smoke output identify the failed capability without returning credential values.

## Owner-run verification

The installer supports `-SkipChecks` because the project owner requested to run the full suite locally. Skipping checks during installation does not waive the release gates above.
