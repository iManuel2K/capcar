# CapCar analytics

PostHog's public project token and ingestion host are supplied at build time:

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
- `NEXT_PUBLIC_POSTHOG_HOST` (currently the US ingestion region)

These are public browser configuration, not personal API credentials. Configure them on Netlify with the Builds scope and rebuild after changing them. The SDK version is pinned and locked.

## Collection and privacy

The SDK is dynamically imported only after explicit analytics consent. Without consent, with Do Not Track, or without configuration, no analytics events are sent. Analytics settings can be reopened in the site footer or privacy page. Consent copy and disclosures cover all five locales. The consent choice is stored locally; the SDK stores a random browser identifier after acceptance.

Session replay, automatic click capture, surveys, exceptions and feature flags are disabled. No account `identify()` call is used. The no-external SDK build avoids loading third-party scripts and replay code. CSP permits connections only to the configured US ingestion origin in addition to the site's existing providers. Changing regions requires updating both the environment host and CSP (and the UI host/disclosures).

Paths are normalized before capture: private detail IDs and unknown roots are replaced, known public Journal slugs are retained, and query strings/hashes are excluded. Only validated UTM values are captured from queries. A property allowlist strips SDK-added referrer URLs, initial URL properties, account properties and other unapproved data. PostHog can still process browser/device information, request IPs and IP-derived location. Never add emails, form content, VINs, plates, passport tokens, diagnostic notes, calendar/mail content or trip destinations to analytics events.

Revocation blocks future queued captures through `before_send` and opts the SDK out. It does not automatically delete historical events. Data retention and account-level access controls should be configured in PostHog. Consent and blockers mean analytics totals are incomplete; Supabase Auth remains the source for account counts.

## Events

| Event                     | Trigger                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `$pageview`               | Initial consented view and App Router navigation                                     |
| `journal_article_viewed`  | Known Journal article; includes public article slug                                  |
| `journal_action_clicked`  | Continue from an inline checklist into the vehicle workspace                         |
| `journal_checklist_saved` | Checklist explicitly attached to an owned vehicle                                    |
| `journal_signup_clicked`  | Click from a Journal article to registration                                         |
| `signup_submitted`        | Supabase accepts registration request; not proof of confirmed/new account            |
| `login_completed`         | Password login returns a session                                                     |
| `vehicle_added`           | User form successfully creates a local vehicle; edits and seeded demos excluded      |
| `build_item_added`        | User form successfully creates a build item                                          |
| `guide_opened`            | Navigation to an individual vehicle guide path; library/review pages excluded        |
| `trip_plan_created`       | Trip planner receives a successful plan response; not a saved trip or verified route |

Events carry normalized page URL/path and selected UI locale. Journal events also carry the public article slug. No past activity is backfilled.

## Verification

1. In a fresh browser, verify there are no PostHog requests before a choice or after declining.
2. Allow analytics, navigate to a Journal article and use its inline checklist and registration links. Check ingestion requests and PostHog's live events.
3. Open Analytics settings and decline. Verify further actions do not send events.
4. Repeat with Do Not Track, a private vehicle path, and authentication query parameters.
5. Build dashboards for Journal conversion, feature adoption and returning browsers. Keep test visits distinct from business conclusions; do not equate registration submissions with confirmed accounts.
