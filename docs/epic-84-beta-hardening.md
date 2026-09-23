# Epic 84 — Beta hardening

Epic 84 validates the integrated beta and corrects the remaining false-negative production smoke check.

## Passport smoke contract

Next.js can stream a segment-level `notFound()` result after the HTTP status has already been committed. On Netlify, Capcar's missing public Passport therefore arrives as HTTP 200 while rendering the dedicated unavailable state with `noindex` protection.

The smoke test now accepts either:

- a direct HTTP 404; or
- HTTP 200 containing both exact Capcar unavailable markers and `noindex` metadata.

An ordinary HTTP 200 Passport page, a generic error response, or an unavailable-looking page without crawler protection still fails.

## Verification completed

- Prettier
- ESLint
- TypeScript strict checking
- Complete Vitest suite
- Next.js production build
- Production smoke test against `https://capcar.dev`

No environment variables, dependencies, database migrations or product data are changed by this package.
