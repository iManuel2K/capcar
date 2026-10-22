# CapCar security review — 22 October 2026

## Summary

Reviewed the nine supplied Instagram slides against CapCar's Next.js/React APIs, Supabase migrations, private storage, provider adapters, offline worker and scheduled jobs. This is a code and configuration review, not a penetration-test certification. Confirmed defects have fixes in this workspace; deployment and database migration are separate rollout steps.

The main findings were unsafe map-label HTML, caller-controlled database quota windows, body limits enforced after buffering, missing request-origin checks, production authentication/quota fallbacks, unsafe copilot links and offline caching that ignored HTTP privacy directives. Dependency updates address the published advisories available during this review.

Read-only inspection of the connected `capcar` Supabase project found RLS enabled on all 26 public tables. It also confirmed that the live quota RPC still uses caller-supplied windows, leaked-password protection is disabled, and storage/schema provisioning differs from the repository. No production database or hosting settings were changed during this review.

## Findings fixed in source

### 1. Critical advisory severity — vulnerable framework and dependency versions

- Rule: `NEXT-SUPPLY-001`.
- Locations: `package.json:31`, `pnpm-lock.yaml`, `pnpm-workspace.yaml:9`.
- Evidence: the original Next.js version was `16.3.4`; registry audits reported critical/high advisories. A refreshed audit also flagged the interim `16.3.8` version and identified `16.4.1` as the minimum fix for three additional advisories.
- Impact: vulnerable framework code can expose availability, confidentiality or execution risks when the advisory's affected features and deployment conditions apply.
- Fix: update Next.js and its ESLint configuration to `16.4.2`, update vulnerable compatible transitive dependencies and Vitest, and constrain Vite to its patched release. Move the scaffolding CLI and test database to development dependencies.
- Scope note: advisory severity is not proof that every exploit is reachable in CapCar. For example, the image-optimization SSRF advisory requires remote image configuration that this app does not currently enable. Keep the lockfile and audit the resolved tree before release.

### 2. High — trip stop names interpreted as HTML

- Rules: `NEXT-XSS-001`, `JS-XSS-001`.
- Locations: `src/components/trips/trip-route-map.tsx:98`, `src/features/trips/trip-stop-marker.ts:1`.
- Evidence before fix: `element.innerHTML = ...<strong>${label}</strong>`; names originate in request/provider/AI data and are not restricted to plain markup-free strings.
- Impact: a malicious stop name could introduce active HTML into the signed-in app. The existing CSP permits inline scripts, increasing the importance of removing this sink.
- Fix: create the existing `span` and `strong` elements and assign `textContent`; retain the marker's class and layout.
- Verification: a regression payload containing image/event-handler and SVG markup remains literal text and creates no active nodes.
- Scope note: Roadbook's other reviewed `innerHTML` sinks use fixed icon strings; JSON-LD output escapes `<`. Those are different from this untrusted-label sink.

### 3. High — authenticated callers could reset quota windows

- Rule: server-side authorization and rate-limit integrity.
- Locations: `supabase/migrations/20260908140000_add_beta_api_rate_limits.sql:13`; fix in `supabase/migrations/20261022154914_security_review_hardening.sql:5`.
- Evidence: `consume_api_rate_limit` is executable by authenticated users and originally reset counters using caller-supplied `p_window_seconds`. A direct call with a short window could reset the counter before the normal API's window elapsed. Arbitrary route names could also allocate counter rows.
- Impact: users could exceed intended provider allowances and create avoidable database load/cost.
- Fix: database-owned route allowlist, canonical windows, maximum quotas, explicit null rejection and bounded counters. Preserve the RPC signature and atomic upsert for existing clients.
- Verification: PostgreSQL tests cover the direct-RPC reset attempt, the hourly specialist window, user isolation, anonymous/direct-write denial and the quota boundary.
- Rollout: this is **not fixed on the live database until the new migration is applied**. Live inspection confirmed the original function remains installed.

### 4. Medium — body size was checked after buffering

- Rule: `NEXT-INPUT-001` / resource bounds.
- Locations: `src/lib/http/read-bounded-body.ts:16`, `src/lib/api/guard.ts:148`, `src/features/providers/external-json-provider.ts:23`, `src/app/api/community/photo/route.ts`.
- Evidence before fix: JSON requests and generic provider responses called `.text()` before checking actual bytes. The multipart upload had an actual-byte limit but no read deadline.
- Impact: absent or dishonest Content-Length could make requests allocate beyond their intended limit; stalled uploads could retain work unnecessarily.
- Fix: shared streamed byte limits, cancellation and a finite read deadline; use the same reader for multipart uploads and provider response bodies. Preserve schema validation and private-file ownership checks.
- Verification: tests cover oversized streams with missing/false length, early declared-size rejection, UTF-8 boundaries, binary preservation and stalled cancellation.

### 5. Medium — four cookie-authenticated POST routes lacked origin checks

- Rule: `NEXT-CSRF-001`.
- Locations: `src/app/api/catalog/search/route.ts:13`, `src/app/api/offers/search/route.ts:13`, `src/app/api/vehicle-data/resolve/route.ts:13`, `src/app/api/copilot/chat/route.ts:13`.
- Evidence: these handlers entered auth/provider logic without the same-origin check already used by other product routes.
- Fix: reject missing/cross-site origins before authentication, quota or body work. Keep configured Netlify/public origins supported through the existing validator.
- Verification: route-level tests assert HTTP 403 before downstream work.
- Scope note: SameSite cookies and browser CORS reduce exposure but are not substitutes for consistent server checks.

### 6. High — deployed API protections could fall back to local allowances

- Locations: `src/lib/api/guard.ts:82`, `src/lib/api/public-retail-guard.ts:50`, `src/lib/api/runtime.ts:1`.
- Evidence: missing Supabase configuration made `guardProductApi` return success; retailer quota errors permitted an in-process fallback, independently replenished on each serverless instance.
- Impact: misconfiguration or quota-service failure could expose configured providers without the intended shared protections.
- Fix: fail closed with HTTP 503 in production; preserve browser-local demonstrations during development. Production retailer search requires a successful database allowance.
- Verification: tests cover each production marker, missing users, unavailable quota service and absence of production fallback spending.
- Behavior change: during a protection-service outage, live searches stop temporarily instead of consuming an uncoordinated provider allowance.

### 7. Medium — offline caching ignored privacy directives

- Rule: `REACT-SW-001`.
- Locations: `public/sw.js:1`, `public/sw.js:37`.
- Evidence: successful navigation/static responses were cached without checking `Cache-Control` or credential-sensitive `Vary` headers. Cache Storage does not automatically enforce those HTTP directives.
- Fix: reject private/no-store/no-cache responses, redirects, credential-sensitive variants, RSC requests and Authorization-bearing requests. Bump the cache version to remove legacy cached entries during activation.
- Verification: worker tests cover private paths/headers and retain public offline navigation caching.
- Scope note: no cross-user data disclosure was demonstrated; this closes a cache-policy gap.

### 8. Low — copilot action schema accepted external protocol-relative links

- Rule: `REACT-REDIRECT-001`.
- Location: `src/features/copilot/copilot-schema.ts:36`.
- Evidence: `.startsWith('/')` accepted `//attacker.example` in provider-generated actions.
- Fix: use the existing strict same-site path validator, including backslash and control-character rejection.
- Verification: tests reject protocol-relative/external/script links and preserve normal garage actions.

### 9. Medium — route-map and Google operations had no API quotas

- Locations: `src/app/api/ai/trips/route-map/route.ts:23`, `src/app/api/connections/google/sync/route.ts:31`, `src/app/api/connections/google/calendar/route.ts:40`.
- Evidence: route maps can fan out to paid/external geocoding and routing; Google sync can fetch multiple messages. These handlers previously lacked the shared product guard.
- Fix: add per-user shared quotas and matching canonical database policies. Existing account checks remain in place for Google operations.
- Verification: tests enforce the route-map quota before request-body/provider work. End-to-end Google operations require staging credentials and were not exercised against a user's calendar/mail.

## Remaining findings and operational work

### 10. Medium — leaked-password protection disabled in live Supabase

The connected project's security advisor reported this setting disabled. Enable it in Auth settings if supported by the project's plan, then verify that a known compromised password is rejected in a test account. Do not change subscriptions to enable it without approval. [Supabase remediation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

### 11. Medium — live migration/schema drift needs reconciliation

The read-only database inventory showed only the private `roadbook-visits` bucket. `vehicle-documents` and `listing-photos` buckets were absent, as were the `community_listing_photos` and `specialist_public_profiles` tables expected by source. Several live migration timestamps also differ from repository migration filenames.

Do not blindly replay all historical migrations. Compare the existing objects and migration history, reconcile missing feature provisioning in staging, and apply the new security migration deliberately. Its bucket updates harden existing buckets; they do not create absent buckets or install missing storage policies.

### 12. High advisory severity, development-only exposure — unresolved braces advisory

The audit reported `GHSA-vfj7-8cjw-p6xm` for `braces@3.0.3`, reached through developer tooling. The registry's latest published version was still `3.0.3`; an attempted install of the audit's proposed `3.0.4` failed because it was unavailable. No unresolvable override was retained. Keep untrusted glob inputs out of build/scaffolding tools and update when a verified release is available. Confirm the final audit output before release; moving tooling to dev dependencies is not a claim that the development advisory is fixed.

### 13. Medium defense-in-depth — strict CSP rollout

`next.config.ts` already configures CSP, anti-framing, MIME-sniffing, referrer and permissions headers. Its production script policy still uses `unsafe-inline`. A strict nonce/hash policy needs compatibility testing for static rendering, Next hydration, themes and Sketchfab. Do not remove inline support blindly and break the app. The confirmed untrusted HTML sink was removed directly.

## Coverage of every supplied slide

“Existing” means reviewed source evidence, not proof of every production behavior. “Operational” requires hosting/account configuration or drills. Payments/webhooks are not implemented in the reviewed app.

| Slide | Topic                      | Result                                                                                                                                                                                           |
| ----- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | IDOR                       | Existing owner/participant RLS and authorization tests; live public tables have RLS. Run staging two-account acceptance checks.                                                                  |
| 1     | XSS                        | Fixed map-label sink and restricted copilot action paths.                                                                                                                                        |
| 1     | CSRF                       | Added missing product-route origin checks; existing account mutations already check origins.                                                                                                     |
| 1     | SSRF                       | Framework patch; reviewed generic provider endpoints come from server configuration and reject redirects. No arbitrary request-supplied URL fetch endpoint was identified.                       |
| 1     | File upload validation     | Shared streamed size/deadline enforcement; existing image signatures and storage type/size limits. Private documents use owner-scoped storage and downloads. Missing live provisioning remains.  |
| 1     | Signed URLs                | Existing listing-photo URLs expire after 300 seconds; private document downloads use authenticated storage.                                                                                      |
| 2     | Rollback                   | Operational: release runbook added; no deployment rollback executed.                                                                                                                             |
| 2     | Automated backups          | Operational: verify database backup/PITR and separate object-storage backups.                                                                                                                    |
| 2     | Restore testing            | Operational: isolated restore drill required; no real user data restored.                                                                                                                        |
| 2     | Feature flags              | Existing provider modes gate integrations; emergency disable decisions belong to deployment operations.                                                                                          |
| 2     | Health checks              | Existing `/health` liveness and `/api/readiness` configuration readiness. Dependency health is not certified by liveness.                                                                        |
| 2     | Alerting                   | Operational: uptime, errors, job failures and spend alerts need configured destinations.                                                                                                         |
| 3     | Background jobs            | Existing Netlify background/scheduled scout and price-watch work.                                                                                                                                |
| 3     | Timeouts                   | Existing upstream fetch deadlines; added streamed-body deadlines.                                                                                                                                |
| 3     | Error monitoring           | Server errors exist; external collection/notification and browser reporting need operational setup.                                                                                              |
| 3     | Structured logging         | Existing scheduled-job summaries; do not log full requests, tokens or private mail context.                                                                                                      |
| 3     | Dead letter queues         | Existing job run records capture failures; a durable retry/dead-letter queue is not universally implemented.                                                                                     |
| 3     | Database migrations        | New additive security migration tested in PostgreSQL; live history drift remains a rollout issue.                                                                                                |
| 4     | Database indexing          | Existing primary/unique/indexed lookup paths; production query-plan/load validation remains.                                                                                                     |
| 4     | N+1 queries                | Reviewed community reads batch queries; Google metadata fan-out is bounded and now rate-limited.                                                                                                 |
| 4     | Connection pooling         | App uses Supabase's HTTP API; no new per-request direct SQL pools were introduced.                                                                                                               |
| 4     | Cache invalidation         | Fixed worker privacy handling and versioned cache; existing public Passport reads avoid shared caching.                                                                                          |
| 4     | Retry logic                | Existing sync/recovery logic; do not blindly retry calendar writes or destructive mutations.                                                                                                     |
| 4     | Exponential backoff        | Existing provider/job handling is feature-specific; verify provider throttling in staging.                                                                                                       |
| 5     | Authorization bypass       | Reviewed auth boundaries, RLS and privileged token access; fixed production guard fallback.                                                                                                      |
| 5     | Webhook verification       | No payment or third-party webhook ingestion route identified; scheduled job authorization is separate.                                                                                           |
| 5     | Dependency vulnerabilities | Framework/transitive patches and production audit command; development advisory noted above.                                                                                                     |
| 5     | Prompt injection           | Existing planner separates system instructions and treats connected context as untrusted; structured results have no autonomous account-write authority. Fixed downstream HTML/navigation sinks. |
| 5     | Rate limiting              | Fixed canonical SQL policies, production fallback and unguarded provider operations.                                                                                                             |
| 5     | Load testing               | Operational: controlled staging load only; no production load attack performed.                                                                                                                  |
| 6     | Row-level security         | Live RLS enabled on all 26 public tables; private token tables intentionally expose no client policies.                                                                                          |
| 6     | Race conditions            | Atomic quota upsert; existing listing locks and moderation guards; regression boundary checks.                                                                                                   |
| 6     | Idempotency                | Existing scheduler run key/unique index; calendar writes still require careful retry handling.                                                                                                   |
| 6     | Server-side validation     | Existing Zod/SQL boundaries plus streamed byte limits and strict action paths.                                                                                                                   |
| 6     | Database transactions      | Security migration transactional; existing sensitive RPCs execute as database transactions.                                                                                                      |
| 6     | Secret exposure            | Reviewed server-held encrypted AI/OAuth tokens and browser-safe public key usage; no secret values were printed or changed. Not a full historical secret scan.                                   |
| 7     | Disaster recovery          | Operational runbook added; recovery ownership/RPO/RTO and drills remain to be set.                                                                                                               |
| 7     | Cost monitoring            | Shared provider budgets strengthened; billing caps/alerts require platform configuration.                                                                                                        |
| 8     | Payment webhook testing    | Not applicable to current gated billing; required before payment launch.                                                                                                                         |
| 8     | Accessibility testing      | Existing UI tests and keyboard controls; marker markup preserved. No complete assistive-technology audit was performed.                                                                          |
| 8     | Mobile browser testing     | Existing QA scripts; real mobile/browser acceptance remains a release check.                                                                                                                     |
| 8     | Staging environments       | Operational: use isolated deployment/database credentials, not production user data.                                                                                                             |
| 8     | Zero-downtime deployments  | Additive compatible RPC signature; stage migration before app release, then smoke test.                                                                                                          |
| 8     | Data retention policies    | Existing account export/deletion; automated retention of job/audit/storage records needs an explicit policy.                                                                                     |
| 9     | Session expiration         | Existing verified Supabase auth and token refresh; actual JWT/session limits require Auth settings verification.                                                                                 |
| 9     | Least privilege            | Existing revoked client access to encrypted token tables; retain RLS and narrowly scoped privileged APIs.                                                                                        |
| 9     | Audit logs                 | Existing community audit/job records; not a comprehensive privileged-access audit trail.                                                                                                         |
| 9     | Security headers           | Existing centrally configured baseline; strict CSP improvement remains above.                                                                                                                    |
| 9     | End-to-end testing         | Existing smoke/QA scripts; run the production build and staging account journeys before release.                                                                                                 |
| 9     | Contract testing           | Existing request/provider schemas and added route/worker/database regressions.                                                                                                                   |

## Verification

Validation completed against Next.js 16.4.2:

- `pnpm audit --prod`: no known production vulnerabilities. The complete audit retains one development-only `braces` advisory described above; peer dependencies are consistent.
- `pnpm lint`: zero errors; one existing language-selector navigation warning under the newer Next.js lint rules.
- `pnpm typecheck` and `pnpm build`: passed; the production build generated all 92 pages.
- Full application suite: 182 files / 830 tests were exercised. The initial run passed 817 tests and found 13 failures in two stale Studio test fixtures and a file-I/O timeout. The fixtures now use real translation context/current control labels, without changing product UI; the 150-file audio integrity check uses Node and an explicit I/O deadline. A targeted rerun passed all 13 affected/security files and 73 tests, covering every prior failure plus the security regressions. The whole 182-file suite was not repeated after those test-only corrections.
- Runtime security smoke against the local production build: all 15 cross-site, missing-origin and signed-out requests were rejected with HTTP 403/401 and no-store.
- Standard local release smoke: public pages, headers, health, metadata, provider status and missing Passport passed. Readiness correctly stayed HTTP 503 because this local environment lacks the production deployment marker and complete public operator/privacy-contact settings. Those checks were not bypassed.

The security migration was exercised in isolated PostgreSQL/PGlite tests. It has not been applied to the connected production database. No paid provider request, real calendar mutation, production load test or backup restore drill was performed.

See [security operations](docs/security-operations.md) for the release and recovery work that cannot be completed by code changes alone.
