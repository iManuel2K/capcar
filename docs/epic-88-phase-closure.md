# Epic 88 — Ownership and visual-beta completion pass

This is a cumulative Epic 87 + 88 code update for a project already through Epic 86. It is not a claim that every Phase 3 integration is finished. Source was reconstructed from the supplied project and saved Epic packages, not verified against the latest private GitHub checkout. The installer accepts either supplied baseline where applicable and stops before writing if a local file differs. Do not discard newer local work to bypass that guard.

## What this update finishes

- **Costs:** edit an expense without duplicating it, preserve its creation date, remove with confirmation, edit notes, export a vehicle-scoped CSV with formula neutralization, recover from storage errors, and validate budget changes. Editing and removal cannot target another vehicle's record. Euro totals now retain cents.
- **Wishlist:** correct links, merchant names, recorded prices, targets and notes without resetting an ordered/delivered status. Status/removal errors are visible. Removal asks for confirmation. Saved prices are explicitly not live price tracking.
- **Passport:** upload an owned JPEG/PNG/WebP photo, decode and resize locally to at most 1200 px, re-encode without original EXIF/GPS metadata, cap stored photo text below 350 KB, and include it only with explicit consent. Photos remain part of the private garage profile until exported/shared. Photo replacement resets sharing consent. A separate insurance-sharing switch protects policy numbers. Existing owner/VIN consent remains intact.
- **Passport reliability/privacy:** per-car JSON no longer includes the entire garage snapshot. Account-level backup remains in the account tools. Failed share-link reads, mutations and clipboard writes are handled. Duplicate mutations are locked. Vehicle switching resets Passport state. Public/local legacy stamps are labelled unverified notes rather than verified workshop work.
- **Diagnostics:** paste raw reports as well as upload text, CSV, JSON or scanner exports; preview normalized codes before importing, reopen a review, ignore superseded asynchronous files and discard previews on vehicle changes. The Inspector uses the native modal dialog for keyboard containment and focus restoration. Guidance is deterministic, not a newly connected AI model or confirmed diagnosis.
- **Specialists:** remove the fictional directory and self-generated stamp form from the user journey. Display actual enrolled specialist accounts from existing role data, exclude suspended accounts, search names and carry the selected specialist/vehicle into the real work-request form. Previous local beta notes are preserved. Approval, rejection, evidence, revocation and server authorization remain on the existing verified-work system. This is an enrolled-account directory, not a populated, geo-ranked business directory.
- **Sound Studio:** compare two saved recordings without uploading again; one audio player runs at a time; download original audio and recording notes/declared permission; confirm removal of the browser-local copy. Existing rights-documented public recordings remain unchanged. Local recordings are not added to cloud sync or account exports.
- **3D:** keep the existing realistic creator references, show connection progress, return to the static preview after a document-load timeout or iframe error, and allow retry. Cross-origin iframe load does not prove the model rendered; manual preview recovery remains available. No browser extension errors are claimed to be universally detectable.
- **Marketplace:** carry the selected listing through sign-in, explain unavailable/removed selections, return to all listings and collapse the seller form so browsing comes first. Existing review, reporting, inbox and authorization remain unchanged. Current results remain bounded to the latest 100 visible records.
- **Roadmap:** planned items no longer have completed checkmarks; OBD wording explicitly says scan imports. No checkout, licensed movie replica or universal model coverage is falsely marked done.
- **Tooling:** existing ESLint and Vitest backup exclusions remain in place. Installer backups live outside the project. Root formatting and TypeScript configuration files are deliberately left untouched by this package.

Epic 87's resilient retailer search, fitment card, garage summary and shared footer are included. See `docs/epic-87-garage-search-refinement.md` for the detailed search debugging checklist and fitment architecture.

## Phase acceptance and remaining work

| Feature                       | Included capability                                                                                             | Remaining acceptance or dependency                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Vehicle Passport              | Real photo, owner/VIN/insurance consent, vehicle-only JSON/CSV, print/PDF, QR to shared snapshot, revoke/delete | Live owner/stranger/revoked-link checks and mobile/desktop print inspection                                           |
| Wishlist Manager              | Add, edit, status, remove, product handoff                                                                      | Confirm a real retailer item survives account sync; automatic price alerts remain separate planned work               |
| Cost Analytics                | Budgets, category split, ledger correction/removal, CSV                                                         | Compare actual invoices and a second-device restore                                                                   |
| Diagnostic Logs               | Native review, import, deduplication and existing lifecycle                                                     | Real scanner export samples; guidance is not an ECU diagnosis                                                         |
| Specialist Directory          | Real enrolled accounts and work-request handoff                                                                 | Operator must review and enrol real workshops; no fabricated distance/capability data                                 |
| Interactive Vehicle Models    | Opt-in realistic references with attribution and recovery                                                       | More exact, rights-cleared models; current reference geometry is not editable by sketch controls                      |
| Movie Car Replicas            | Still planned, clearly identified                                                                               | Rights-cleared production-quality replica assets and provenance; no film/game-ripped assets were added                |
| Engine & Exhaust Sound Studio | Existing licensed public tracks plus personal library, replay, comparison and exports                           | Broader model-specific, consistently recorded stock/modified coverage; cloud media storage is not included            |
| 3D Homepage Visualizer        | Existing homepage/concept entry and realistic reference collection                                              | No claim of a fully photorealistic configurable native vehicle or universal parts visualization                       |
| OBD-II Scanning               | File/paste import with native code guidance                                                                     | Physical adapter connection, protocol support and hardware testing remain unimplemented                               |
| Verified Shop Stamps          | Existing specialist request/attestation/revocation, connected directory                                         | Real specialist onboarding and two-account acceptance; public Passports do not turn local notes into verified records |
| Direct Merchant Checkout      | Existing retailer handoff only                                                                                  | Merchant checkout authorization and real order/payment integration, including failure/cancellation/refund lifecycle   |
| Community Marketplace         | Public browse, sign-in continuation, moderated listings, reporting and private contact                          | Real approved inventory, moderation coverage and live buyer/seller/moderator checks; no escrow or payment processing  |

## Privacy and data changes

New public Passport snapshots omit insurance details unless the owner explicitly enables their inclusion. Existing published snapshots are not rewritten or deleted. Review and revoke older links if they contain details or photos you no longer want public. Printed/exported documents cannot be recalled. A private profile photograph may contain a visible plate or people even after metadata removal; review its pixels before sharing.

Photo files are compressed into the existing profile snapshot; no new public storage bucket is created. Many vehicle photos increase garage snapshot size. Browser-storage failures are surfaced without claiming a successful save. Keep original images/audio separately. This update neither uploads a user's personal files automatically nor grants redistribution rights.

## Installation and prerequisites

No new dependency, migration or environment variable is required. Existing community and public-discovery migrations must be present. `supabase/checks/phase-2-3-readiness.sql` is optional **read-only SQL** to check required tables/functions and RLS flags. It is not a migration or proof of correct policies, grants, operator enrolment or live provider access.

If `community_listings` is missing, the earlier `20260909090000_community_and_verified_work.sql` has not completed in that project. `20260910090000_public_discovery.sql` depends on it. Do not rerun partially applied SQL blindly, delete tables, or paste PowerShell into the SQL editor. Inspect the actual migration state before repairing it.

Retail search uses the existing server-only `CAPCAR_EBAY_CLIENT_ID` and `CAPCAR_EBAY_CLIENT_SECRET`; the recovered legacy provider additionally needs `CAPCAR_EBAY_MODE=live`. Existing optional token/campaign settings are documented in Epic 87. Browse credentials do not, by themselves, implement merchant checkout. Never put secret credentials in `NEXT_PUBLIC_` variables.

## Verification and handoff

The release includes automated regression tests for vehicle-scoped expenses/CSV, wishlist state preservation, specialist eligibility, pasted scan review and stale uploads, selected-listing continuation, model timeout/retry, photo preparation and Passport privacy. Existing database authorization tests use a local PostgreSQL-compatible test database, not your live Supabase project. See `CHECKS.md` in the ZIP for the actual final results.

Production deployment, real eBay access, two-account Supabase testing, native dialog focus behaviour in physical browsers, device audio/3D performance, and PDF pagination remain live acceptance checks. No 9.5/10 UX score is asserted without those checks.

Recommended live acceptance: use two non-production-test customer accounts and an operator-enrolled test specialist; create your own car, edit a cost/wishlist item, upload a photo, opt into the desired Passport fields, print and share, revoke and check anonymously; import a real scan; compare/download two owned recordings; publish a legitimate moderated listing and contact it through sign-in. Never use invented customer listings or mark a workshop verified without review.
