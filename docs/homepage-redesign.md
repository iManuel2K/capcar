# Homepage: a clear first step for car owners

The homepage now leads with maintenance, build planning and drives. It preserves the OEM+ cream, teal and copper palette and uses the supplied BMW photography. The Roadbook preview reuses the owner's supplied product screenshot unchanged, with attribution retained and linked. Next Image serves a resized WebP rather than the full source screenshot.

## Routes and sample safety

- The consistent **Create your garage** action leads to `/garage/new`, not directly to registration. Visitors can identify a car and choose a first action before creating an account.
- Maintenance and modification links seed `goal=maintain` or `goal=modify` only for a fresh onboarding draft. Existing drafts and explicit authentication handoffs take precedence.
- The no-account BMW example reuses the existing local-state parts/budget/Passport sandbox. It cannot purchase anything, write a real garage or transfer demo choices to a new account. The read-only BMW story labels illustrative costs and owner-recorded work explicitly.
- Roadbook and Journal links are public. AI trip planning still uses the existing account and connected-provider checks. Diagnostics/Passport links open the owner's garage; a vehicle is needed to use them. Concept and native OBD previews are labelled honestly.
- Existing routes, canonical metadata, language alternates, authentication validation and structured data are preserved. Async structured data has its own Suspense boundary. The generic loading skeleton now belongs to the garage, rather than hiding public content behind a JavaScript-revealed root fallback.

## Performance and measurement

The hero and three use cases are server-rendered, including their links and real car image. No map, audio, 3D viewer or promotional video is embedded eagerly. The interactive example remains viewport-deferred. New homepage links disable speculative prefetching of heavy tools and private workspaces. Reduced-motion rules avoid decorative animation.

Consent-aware PostHog events are `homepage_primary_cta_clicked`, `homepage_use_case_clicked` and `homepage_demo_engaged`. Properties are fixed, allowlisted placement/use-case/action enums only. Existing URL redaction and consent/Do Not Track checks remain in force. No vehicle details, free text, user records or private URLs are added.

## Reproducible checks

- `pnpm build`, `pnpm typecheck`, focused ESLint and the Vitest suite.
- `scripts/qa-homepage.mjs`: local production browser checks, five languages, 1440px desktop, 390px and 320px mobile, primary CTA above the fold, reduced motion, navigation focus/escape, accessible demo tabs/reset, all main links/anchors, local-only demo state and useful content without JavaScript. Screenshots/report go to ignored `artifacts/homepage/`.
- `scripts/qa-garage-journey.mjs`: starts at the homepage for each goal and checks intent preselection, new-account signup, first useful action, interrupted drafts, existing accounts, mobile layouts and account isolation. Uses a disposable local API double, never production accounts.

Browser scripts require Playwright (`PLAYWRIGHT_MODULE` may point to the bundled runtime). Homepage QA defaults to `http://localhost:3116`; garage QA can launch a dev instance with `GARAGE_QA_START=1`.

## Limits

Final verification: production build and type checking passed; changed-file ESLint passed. Homepage browser checks and the isolated homepage-to-first-action harness passed with no browser errors. The latest full Vitest run passed 629/630 tests: the existing Sound Studio recording-archive comparison test was intermittent. All six tests in that file passed on an isolated rerun, alongside the homepage/onboarding/privacy tests (28/28 focused tests). No unrelated Sound Studio code was changed.

The Roadbook screenshot is the supplied English interface; surrounding copy and links are localized in all five supported languages. Actual live map data and connected AI providers remain service-dependent. Email delivery, production RLS and real provider billing are not tested by the isolated journey harness. Browser checks do not replace assistive-technology testing on physical devices. This change does not publish or deploy itself.
