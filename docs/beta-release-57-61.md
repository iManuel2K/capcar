# Epics 57–61 · Beta completion

## Epic 57 — Garage sync reliability

- Sync reacts to garage storage events and browser connectivity instead of relying on a polling interval.
- Local changes are debounced, retried visibly and retained while offline.
- A device/cloud conflict requires an explicit choice; Capcar does not silently overwrite either garage.
- Sign-out refuses to discard the local garage when the final cloud upload fails.
- Snapshot payloads and imported account backups are schema-validated before application.

## Epic 58 — Public Vehicle Passport

- Published links now resolve through `/passport/[shareId]`.
- The public view is read-only, no-index and restricted to explicitly public Supabase rows.
- Owners can create, copy, revoke, restore and permanently delete their links.
- VIN display is reduced to the final five characters where a VIN is present.

## Epic 59 — Security and platform hardening

- Product-data routes require a verified Supabase user when cloud mode is configured.
- Per-user, per-route limits are enforced atomically by Supabase.
- Request bodies are size-bounded and schema-validated; provider errors are not returned to clients.
- The service worker caches only the public shell and static assets, never garage, account, authentication, Passport or API responses.
- CSP, clickjacking, MIME-sniffing, referrer, permissions and transport headers are configured centrally.

## Epic 60 — Account lifecycle and legal baseline

- Account data can be exported, cloud garage data can be deleted and the current account can be deleted.
- Affiliate clicks are associated with the authenticated user after migration, allowing their deletion with the account.
- Privacy, terms and imprint pages use deployment-supplied operator and contact details.
- Deployment readiness remains blocked until real legal identity variables are present.

## Epic 61 — Release quality

- Format checking is part of the full release check.
- Installer backup paths are excluded from Prettier, ESLint and Vitest.
- `/health` returns a no-store status, release identifier when available and check timestamp.
- `pnpm smoke:production -- <url>` verifies critical public and access-control behavior.
- The beta runbook includes a two-account isolation test and mobile/keyboard acceptance pass.

## Deployment-owned work

These items cannot be completed safely in source code alone:

1. Apply both `2026090814...` Supabase migrations after the earlier migrations.
2. Enter the real operator name, postal address and privacy contact in Netlify.
3. Have the privacy, terms and imprint wording reviewed for the operator's jurisdiction.
4. Run the production smoke test after deploy and complete the two-account RLS test.
5. Resolve naming/trademark clearance before widening the beta; an automotive business already uses the CapCar name.

Provider feeds, verified specialist records, affiliate campaigns and Capcar Pro billing remain deliberately gated beta work rather than launch blockers for the private beta.
