# Public design audit follow-through

Local implementation, October 21, 2026. No new packages, account migrations or authentication changes.

- Preserved the teal/cream/copper identity, left-to-right hero comparison, original car imagery and existing routes.
- Added an illustrative next task and planned/actual budget to the hero. Moved the interactive example ahead of the detailed story; replaced equal text columns with a connected job sheet.
- The isolated BMW example starts with a cabin-filter plan. Recording the example job reconciles the planned amount to €28 actual; reopening reverses it without duplicate entries. No owner records are saved. The sample Passport uses whole-car framing and no longer implies that a decorative QR opens a live verified record.
- Mobile analytics consent stays in document flow, not over the CTA. Accept/decline remain equally accessible; full existing disclosures are expandable. Consent gating is unchanged.
- Translated Concept Studio controls, status/error messages, camera controls, downloads, credits labels, search and local saving across English, German, Greek, Albanian and Japanese. Original creator notes remain explicitly labeled source-language material; proper model names and attribution are preserved.
- Removed redundant Studio badges/nested framing. The renderer uses transparency, controls remain outside the car, and the poster remains available during loading/failure.
- Sound Studio uses honest Reference A / Comparison B labels and reaches the first playback control sooner on phones. No purported verified stock/modified pairs are invented.
- Roadbook retains all nine styles with keyboard support in a compact disclosure. Film images are contained with titles/actions outside them. Journal has a lead story and lighter secondary rows. Roadmap groups status labels, progressively discloses milestones and uses live catalogue counts with accurate trip-planner availability.

## Verification

- Focused interaction tests cover cost reconciliation/reopening, consent gating, translated Studio controls, model loading/failure, audio comparison, map-style keyboard control and existing public journeys.
- Full regression run: 171 files / 760 tests passed. Final demo regression was rerun after the sample Passport refinement.
- Type checking, scoped lint and production build passed. A corrupted generated `.next/dev/types/validator.ts` was removed and the production build regenerated valid types; application source was not changed to bypass checking.
- `scripts/qa-public-polish.mjs`: 32 page/viewport checks at 375/768/1024/1440px plus five-language Studio search/save, real model loading/camera/disposal, real local audio switching, consent and the example completion flow. Report/screenshots: ignored `artifacts/public-polish/`.

## Boundaries

Hallmark was requested but its skill file was not available. Followed `AGENTS.md` and the approved CapCar design rules instead. Original source model notes are not automatically translated. Browser emulation is not physical-device testing; one real 3D model was exercised, not all 25. The live specialist-directory loading error observed during the audit still requires separate backend investigation. No changes were pushed or deployed by this implementation.
