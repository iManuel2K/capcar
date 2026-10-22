# Security release and recovery operations

This runbook accompanies `security_best_practices_report.md`. It describes required operational work; it does not assert that backups, alerts or staging infrastructure have already been configured.

## Release the security fixes

1. Review the source diff and preserve the user's installed skills and existing changes.
2. Verify the resolved dependencies with `pnpm audit:production`, then run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`. Keep the lockfile frozen on the deployment host.
3. Compare the linked Supabase migration history and actual schema with the repository. Several production migration timestamps differ, and the file/photo feature provisioning is incomplete. Do not blindly run a command that replays all missing historical migrations.
4. In an isolated staging database with the required baseline tables, apply `20261022154914_security_review_hardening.sql`. This keeps the existing RPC signature, enforces database-owned quotas and hardens already-provisioned private buckets. Provision missing buckets/policies separately from the reviewed historical feature migrations after checking for conflicts.
5. With two staging accounts, verify that each can read/write only its own garage and documents; listing moderation and published photo access must still work. A signed-out caller must not obtain private tokens or files.
6. Test a direct quota RPC using a shortened window: it must not reset an exhausted normal window. Confirm trip-route, Google sync and calendar quota responses. Do not send real mail/calendar mutations while checking a test environment.
7. Apply the reviewed migration to the intended production project, then deploy the verified app build. Missing account/quota configuration now returns HTTP 503 instead of allowing provider spending.
8. Run `pnpm smoke:production -- https://<deployment-host>` and `node scripts/capcar-security-smoke.mjs https://<deployment-host>` against the released deployment. The security probes send signed-out requests and must stop before provider work. Verify private responses use no-store and the updated service worker activates normally. Check login, garage sync, Passport revoke, map labels and the five supported languages.

## Authentication settings

The live advisor reported leaked-password protection disabled. Enable it when supported by the current plan; do not upgrade a plan automatically. Verify with a disposable test account. Check access-token expiry, refresh rotation and session controls against the actual Auth settings. Client-side cookie lifetime alone is not a session-expiration policy.

Do not switch Supabase's shared browser/server auth cookies to HttpOnly without redesigning the browser client flow. Preserve verified server auth and protect against XSS instead of breaking account behavior.

## Backups and restore drill

- Record a recovery owner, recovery point objective (acceptable data loss) and recovery time objective before wider launch.
- Verify automated Supabase database backups/PITR and their retention. Database backups do not substitute for separately protecting uploaded object contents.
- Keep encrypted storage backups and a secure record of the connection-encryption key versions needed to decrypt restored tokens. Never include keys or connection strings in this repository or its report.
- Restore to an isolated project, with jobs, email, AI and payment writes disabled. Test schema, counts, ownership isolation, representative files and account deletion using test data. Record the restore time and any failures.
- Keep the current production system intact during a drill. A successful backup job is not evidence that restores work.

## Rollback

Retain the previous known-good hosting deploy and its release identifier. If the app build fails acceptance, restore that deploy and verify `/health`, login and garage reads. Prefer retaining the security migration: its RPC signature is backward compatible and ownership protections must not be weakened as a shortcut.

Use a forward migration for database corrections. Restoring a whole database to undo code can discard newer owner data and must be an explicit incident decision. Retain logs and timestamps needed to understand what happened.

## Monitoring and spending

Configure external probes for `/health`, plus a readiness/dependency probe appropriate to the environment. Liveness returning 200 proves only the web handler responded. Alert the actual on-call destination for sustained 5xx/latency, failed scheduled runs, database/storage limits and unusual provider spending.

Use Netlify, Supabase, retailer and AI billing controls where available. The application quotas limit request volume; they are not a monetary guarantee. User-owned AI keys can have separate provider/project budgets. Avoid logging raw user requests, API keys, signed URLs, OAuth tokens, mail subjects or calendar contents.

Persist failed background job identifiers and sanitized failure categories. Retries should be bounded and use jitter/backoff; use existing run keys to avoid duplicate work. Route poison jobs to a durable failure record for inspection. Do not retry account deletion, calendar insertion or future payments merely because a network response was lost.

## Staging acceptance and retention

Run controlled load against staging, increasing concurrency gradually and stopping on error/cost thresholds. Cover auth failures, rate limits, upstream timeouts, duplicate/out-of-order scheduler events and provider schema errors. Do not load-test live third-party APIs without their approved test mode and budget.

Use keyboard and mobile browser checks for login, garage, private documents, maps and translated layouts. Do not equate DOM unit tests with screen-reader or real-device validation.

Set explicit retention periods for audit records, job runs, unused uploads and backups. Review account deletion end to end, including storage objects and encrypted external connections. Verify the deletion policy against backup retention and explain that delayed backup expiry is different from active-account access.

Before enabling payments, add signed raw-body webhook verification, persistent unique event IDs, transaction-safe updates and duplicate/delayed/out-of-order event tests. Current gated billing is not evidence of a tested payment implementation.
