# CapCar interaction polish

Adapted from the requested SmoothUI interaction documentation, using CapCar's existing React/Motion stack, dark teal, warm cream and copper. No new package, font, analytics payload or external service is introduced. These are locally maintained adaptations, not an installed SmoothUI dependency.

## Where the patterns are used

- Expandable navigation: the public header groups garage, drives and supporting tools. Measured panel heights, content transitions, pointer hover, click/touch, Escape, outside click and focus-leave behavior. The existing mobile drawer retains all destinations and gets a reduced-motion-aware entrance and explicit focus wrapping.
- Conversation, input and response: the garage copilot retains session replies, keeps its composer next to the thread, preserves drafts during requests and supports genuine request cancellation. Enter sends, Shift+Enter inserts a line and IME composition does not accidentally submit. Scrolling up suspends auto-follow; a latest-message button restores it. The trip planner reuses the composer and response presentation while preserving its existing structured-route mode, account requirement and provider integration.
- Motion loader: a small CSS wave glyph replaces the existing busy spinners in account/authentication actions, search, map/model loading, recalls, Passport, trip creation and toast loading. Existing skeletons remain useful layout placeholders. Labels belong to the surrounding control/status, or to the loader when it is standalone. Reduced motion produces a static frame; no artificial loading delays.
- Video modal: guide videos, movie/TV clips and the existing walkthrough component use one on-demand dialog. Local video keeps native controls and captions; external embeds are limited to YouTube's privacy-enhanced origin and Vimeo. Nothing plays automatically or loads an external player before a click. Close/Escape restores focus, closing removes the player, hiding the tab pauses local video and removes remote players. Unsupported embeds keep a source link. This does not add videos to pages that do not already have them.
- Reading progress: localized Journal articles get an article-relative, left-to-right copper reading bar. Passive scroll/resize listeners update a transform in one animation frame, without rerendering the article or announcing every percentage as a live message.
- Sound Studio: the shared real-audio player gets a caller-driven record toggle, actual progress ring, decorative playback bars and buffering indicator. The existing native range remains the keyboard/touch seek control. Playback, A/B exclusivity, master volume, source fallback, retries and local personal recordings remain intact. The decorative bars indicate playback, not measured acoustic data.

## Boundaries

The garage copilot remains honestly labelled rule-based; this work does not enable a new LLM, stream, or server-side chat-memory service. Session messages are not persisted or added to analytics. The AI trip planner still requires a signed-in account and connected provider. No real account or paid provider request is used by these UI tests.

New shared control copy covers English, German, Greek, Albanian and Japanese. Existing editorial, source and provider response content is not automatically translated.

Third-party clip embedding, caption availability, geographic restrictions and provider uptime remain controlled by their publishers. A source link is always available after opening. Browser tests isolate external players; they verify modal behavior, not the publisher's media availability.

## Verification

Run the normal type, lint, test and production-build checks. Focused tests include `smooth-interactions.test.tsx`, `copilot-workspace.test.tsx`, `trip-planner.test.tsx` and the existing Sound Studio/movie-gallery suites.

`node scripts/qa-smooth-interactions.mjs` launches an isolated local app and headless Edge. Supply `PLAYWRIGHT_MODULE` if Playwright is not on normal module resolution. It checks five-language navigation at desktop/phone sizes, keyboard modal boundaries, deferred media, article progress, real local A/B audio playback, conversation send, narrow layouts at 320/768/1024px, reduced motion and preserved `/ai` login intent. It uses local fixture vehicles and a mocked copilot response, never production user records. Reports and screenshots go to ignored `artifacts/smooth-interactions/`.

## Reference documentation

- https://smoothui.dev/docs/components/expandable-navbar
- https://smoothui.dev/docs/components/ai-conversation
- https://smoothui.dev/docs/components/ai-prompt-input
- https://smoothui.dev/docs/components/ai-response
- https://smoothui.dev/docs/components/motion-loader
- https://smoothui.dev/docs/components/video-modal
- https://smoothui.dev/docs/components/scroll-progress
- https://smoothui.dev/docs/components/music-toggle
