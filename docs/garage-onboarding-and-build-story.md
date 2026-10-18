# Personalized garage onboarding and build stories

## Scope

- `/garage/new` is an unauthenticated **draft-only** entry. Other garage routes remain protected. Main header/hero calls to action use it; direct registration defaults back to it. Existing explicit auth return destinations are preserved.
- Four short screens implement car → goal → first action → save. Only make, model and production year are required. Existing cars can be reused without rewriting their specification.
- The chooser reuses all 25 existing visual-reference catalog entries and adds six entries aligned with published issue coverage (including the two Mazda 3 chassis periods). Manual entry remains available for any other car. Visual reference availability does not guarantee an exact generation, body or trim match.
- Coverage counts come from existing issue research and planning-part catalogs. No new failure claims, live inventory or fitment promises are invented. Unknown engine/body/transmission stay unknown; missing mileage is not presented as a real zero reading. Fitment requiring those details returns unverified.
- An explicitly labeled, read-only example is available before entering information. It links to the existing interactive homepage garage example without seeding the owner's garage.
- The selected goal personalizes the garage overview and vehicle workspace. A first maintenance/modification plan reuses the existing build and task models; it is **planned**, not completed. A drive idea is stored privately in the onboarding snapshot extension. No route or safety verification is implied.
- Free-text maintenance work appears as owner-recorded maintenance in the timeline and Passport. It does not silently reset a catalog service interval: the structured maintenance workflow still asks for the actual service type, date and mileage when that information is needed.

## Drafts, accounts and persistence

Drafts are functional browser-local data in `capcar.onboarding-draft.v1:<account-id|guest>`, excluded from cloud snapshots. They expire after seven days when next read; start-again replaces the active draft. Saving clears the active draft. Browser storage must be available. Clearing browser data or continuing on another device cannot restore an unassigned draft.

Authentication return URLs carry only a random draft ID (`resume`), never vehicle details or free text. An explicit handoff marker must match that ID before a guest draft can be adopted by a signed-in account. Local storage allows confirmation links in another tab of the **same browser** to restore the draft. Account drafts use separate keys; changing accounts does not import the other account's draft. Draft adoption is not an authorization decision; private snapshot access still uses the existing verified Supabase user and owner-scoped RLS.

Saved goals, drive ideas and activation state use `capcar.onboarding.v1`, included in the existing owner-scoped `garage_snapshots` payload. Vehicles and tasks remain in their original storage keys. Stable onboarding IDs make retries idempotent, including a quota error between writing the vehicle, starter build and final onboarding record. Starter build plus first task are one write. Snapshot reconciliation itself is unchanged; cross-tab draft writes no longer mark an account snapshot dirty.

## Completion records and financial reconciliation

- Each build task can hold one optional completion record: date, short private note, before/after photos, actual total cost and accounting preference.
- Completion records are saved atomically with task status. Progress is the number of installed/completed tasks divided by all tasks in the build, equally weighted. Empty builds are 0%; adding or reopening tasks can lower progress. A manually selected build status does not override task-based progress.
- The timeline derives one stable `installed-<task-id>` entry from the task. Editing and completing again update that entry rather than appending another. Reopening removes that completion entry, retains the private draft and keeps an actual purchase recorded.
- Planned estimates, selected quotes, forecast and actual recorded cost remain separate. An omitted estimate or actual is not a zero-cost claim. An unset starter budget is shown as unrecorded, not overspending.
- Selecting a quote updates the quoted/forecast amount without rewriting the owner's original planning estimate. This preserves a meaningful planned-versus-actual baseline.
- For a task with a purchase, the entered actual completion cost is a **total including that purchase**, not an additional charge. One linked expense is derived from the task, replacing the purchase-only total. A completion cannot predate delivery/order or cost less than the existing net purchase. A corrected purchase/refund reconciles the linked total while preserving installation extras. `already-recorded` accounting avoids another expense; real refunds remain in the purchase workflow.
- Tasks without a purchase contribute their actual completion cost only while completed. Reopening removes that derived expense. No second expense/history copies are stored.
- Passport exports reuse the same status, date and actual cost, with an owner-recorded actual basis. Completion notes/photos and the private car photo are never implicitly projected into public Passport data. Owner recordings are not professional verification.

## Photos and sharing

Photo processing reuses Passport's JPEG/PNG/WebP validator: maximum 10 MB input, 50 megapixels, 1200 px longest edge, bounded JPEG output. Re-encoding copies pixels, not EXIF/GPS metadata. It does **not** blur a visible registration plate, face or background. Rejected files and quota errors keep the user's form inputs available for correction.

Optional 1080 × 1350 PNG progress cards accept only task counts and percentage—no vehicle object, titles, photos, notes, VIN, plates, locations, costs or identifiers. The user explicitly creates, downloads or opens the platform share sheet. Cancelling is not treated as a published share; a download/share event represents a request, not proof of publication. No new public-link database or automatic posting is introduced.

Photos remain bounded embedded images in the existing private snapshot architecture, not a new object-storage service. A large photo collection can exhaust browser quota; the interface reports the failed save without overwriting the stored task. A dedicated private media pipeline remains a future scalability improvement.

## Consent-aware measurements

All measurements reuse `trackAnalytics`; the SDK remains unloaded before analytics consent, and refusal/Do Not Track remain respected. Session replay, autocapture and personal profiles stay disabled.

- `onboarding_started`, `onboarding_step_viewed`, `onboarding_step_completed`, `onboarding_skipped`
- `onboarding_interrupted` on hiding/leaving an unfinished flow (a drop-off signal, **not proof of permanent abandonment**)
- `onboarding_auth_requested`
- `first_useful_action_completed` and `onboarding_activated`: the car exists and a useful plan/idea is saved. Completion here means the **onboarding action** is saved, not that physical vehicle work has happened. If setup was skipped, saving a first build task or maintenance record later can activate it.
- `build_task_completed`, `build_task_reopened`, `build_progress_updated`, `build_timeline_viewed`, `build_share_card_created`, `build_share_requested`

Journey properties are restricted to enumerated step/goal/action types, aggregate progress buckets and bounded elapsed seconds. No account, car, build or task ID; make/model/VIN; note; trip title; photo; price or location is sent. Existing URL sanitization excludes auth and resume queries. Time to first useful action uses the durable draft start time, capped at seven days; consent-denied journeys are intentionally absent. Interrupted and resumed steps can be analyzed as a funnel rather than labeling every hidden tab permanently abandoned.

## Verification

Unit/component regression tests cover all three goals, skip behavior, existing vehicle preservation, retry/quota idempotency, draft ownership/expiry, Strict Mode/auth handoff, snapshot persistence, duplicate expenses/history, zero-cost work, invalid/future/pre-delivery dates, blocked dependencies, reopening, purchase/refund reconciliation, private photo handling, Passport projection, share-card data minimization, analytics consent/redaction and five-language copy parity.

`scripts/qa-garage-journey.mjs` exercises the actual browser interface with an isolated, disposable local Auth/snapshot API double: new accounts for all goals; reload and sign-in; existing-account cloud restoration; existing-car reuse; skipped steps; read-only example; 390px mobile; real bitmap processing for before/after photos; completion/reopening/re-completion; timeline; PNG download; and each supported language. It never creates production accounts or touches live snapshots. Its browser context bypasses CSP solely because the isolated API is localhost; production CSP is not loosened.

Live email delivery, production RLS/session infrastructure, cross-device confirmation and native mobile share-sheet publication cannot be established by this harness. The unchanged Supabase protections and real-device sharing should receive a staging smoke test before release. No schema migration is required for these snapshot extensions, and no deployment is performed by the implementation task.

The complete baseline regression suite passed (147 files / 618 tests), with additional focused tests for later activation and skipped-step navigation. Changed-file lint and the production build pass. Repository-wide lint also reports an existing intentional full-page OAuth anchor in `connection-workspace.tsx` (the Next.js internal-Link rule) and an existing language-selector navigation warning; these unrelated navigation behaviors are left unchanged.
