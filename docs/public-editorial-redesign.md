# Public editorial redesign · 22 October 2026

Reference: user-supplied YOIN screenshot. Adopted alternating visual/text compositions,
quiet serif display headings, restrained borders and generous spacing. Kept CapCar's
teal, cream and copper rather than copying the reference's near-black palette or dim text.
Display typography uses installed system serif fallbacks, including Japanese Mincho;
there are no font requests, new packages, scroll libraries or background videos.

## Scope and ownership

- Homepage: all three use cases visible without tabs; alternating product previews,
  original BMW comparison slider and whole-car cutout, quieter task/history story.
- Platform, maintenance/planner discovery and AI preview: matching editorial styles.
- Studio, Sound Studio, Movie Cars and retail/community pages: dark editorial body
  with a separate readable light workbench for detailed controls.
- Journal index: dark editorial treatment; articles retain comfortable cream reading sheets.
- Roadmap and Roadbook: matching display typography while preserving functional layouts.
- Shared header, navigation, footer implementations, root layout, global theme and garage
  files were not changed. Obsidian Chrome work can be integrated independently. No current
  checkout files were named Obsidian Chrome, so integration with that unfinished version
  cannot be claimed as visually verified.
- Existing English, German, Greek, Albanian and Japanese copy, public routes, metadata,
  authentication destinations and consent-aware event handlers remain in use.

## Verification

- Focused marketing regression suite: 26 tests passed (homepage, platform, discovery, header).
- TypeScript check, scoped ESLint and production build passed.
- Additional Studio checks initially exposed an outdated `next-intl` test mock
  missing `useTranslations`; updated that mock without changing Studio behavior.
- `scripts/qa-editorial.mjs`: 11 routes at 320, 375, 414, 768 and 1440px; four public
  experiences in all five locales at 375px. Verifies HTTP success, horizontal overflow,
  localized HTML language, headings, slider presets/LTR and primary CTA destination/visibility.
- Browser screenshots under ignored `artifacts/editorial/`; desktop hero, phone hero and
  Studio previews inspected. Reduced-motion browser context; existing content remains visible.

## Limits

No physical-device performance benchmark or measured speed improvement is claimed.
No new real-account onboarding, third-party AI, WebGL model-library-wide or backend
availability test was performed. Existing tools are reused rather than replaced.
Legal/account pages remain practical; shared chrome is deliberately outside this redesign.
No deploy or push performed as part of this request.
