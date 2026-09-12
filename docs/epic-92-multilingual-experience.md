# Epic 92 — Multilingual experience

Capcar now supports English, German, Greek, Albanian and Japanese through the existing `next-intl` dependency.

## Product behavior

- The first visit uses a supported browser language when available; otherwise English is used.
- A language selector is available in the public header, mobile menu, footer and authenticated Garage shell.
- The selected locale is saved in the `capcar_locale` first-party cookie for one year.
- The document `lang` attribute changes with the selected locale for screen readers and browser language tools.
- Existing route URLs and working retail links remain unchanged.

## Localized surfaces

- Public desktop and mobile navigation
- Homepage hero and calls to action
- Global parts search
- Connected Parts title, search form, filters, loading/error/empty states and result actions
- Community navigation
- Garage navigation and vehicle-tool labels
- Global footer and safety notice

Long-form legal wording and specialist feature copy intentionally remain in their approved English form until each translation receives native-speaker and legal review. The English text remains a safe fallback; no interface key is displayed to users.

## Engineering notes

- Locale validation is centralized in `src/i18n/config.ts`.
- Server-side locale resolution is in `src/i18n/request.ts`.
- Translation catalogs live in `messages/` and are protected by a parity test.
- No environment variables or external translation service are required.
- Locale-prefixed routes were deferred to preserve every existing beta URL. They can be introduced later with redirects and `hreflang` metadata when localized SEO pages are ready.
