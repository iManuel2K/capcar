# Driving Review — implementation and verification

Implemented 8 November 2026. Local implementation; not deployed or published to Instagram in this task.

## Experience

- Public, localized introduction: `/driving-review` and `/de`, `/el`, `/sq`, `/ja` equivalents. Included in the existing canonical, language-alternate and sitemap system.
- Account-bound vehicle picker: `/garage/driving-review`.
- Per-car workspace: `/garage/[vehicleId]/driving-review`, available from More vehicle tools. The public roadmap links to this first beta without claiming full automatic driving-style inference.
- No CapCar feature fee. A free account, a vehicle and an existing personal Gemini, OpenAI or Claude API connection are required to request an analysis. Provider API usage can cost money; a consumer chat subscription does not necessarily include API credits.
- Connect first, choose a 1–60 second MP4/MOV/WebM clip up to 150 MB, inspect sampled frames, exclude private or unhelpful frames, choose a focus, explicitly consent, then request a review.
- At most twelve chronological JPEG stills (longest edge 640 px) are sampled locally. Keep at least two. This is a sparse-frame reflection, not continuous video, audio or telemetry analysis.
- Responses distinguish observations, suggestions, a cited frame timestamp, qualitative uncertainty and limitations. Inadequate evidence can yield zero tips. Owners can dismiss tips before or after saving, save one reflection without duplicates and delete saved entries.
- Learning is initially off. Only explicitly approved coaching topics are remembered for the selected car and included in future review prompts while enabled. Topics can be forgotten, learning disabled or reset. Reset clears preferences and disables learning but preserves saved reflections; the confirmation explains this.
- Twenty latest saved reflections per car. No automatic personality/driver profile, safety score, inferred driving ability, fault attribution or claim of professional assessment.

## Privacy and account boundaries

The raw clip is a local File/blob, never uploaded. Frame preparation is cancellable, times out on decode/seek failure and revokes its blob URL. Frames live in component memory and are released on replacement/navigation; reload requires selecting the clip again. There is no background monitoring or camera/microphone permission.

Only selected images, their clip-relative times, duration, language and approved/requested topic enums go to the same-origin API. No file name, raw audio, GPS, VIN, plate field, vehicle ID, garage records or arbitrary free text is sent as structured context. Images themselves can contain identifying information: the UI explicitly says they are not automatically anonymized, asks owners to remove private frames and explains that provider policies apply.

The server authenticates using the existing Supabase `currentUser()` integration, verifies the request's expected owner to reject stale-account requests, enforces the existing account rate limiter (five requests per five minutes), rejects cross-origin requests, bounds the streamed JSON body to 2.2 MB, validates chronology and JPEG dimensions, and uses only the authenticated owner's existing encrypted AI connection. No new public service credential fallback or database table is introduced.

The app makes one bounded provider request per explicit action, with a 45-second timeout and cancellation; there are no automatic paid retries. The OpenAI request sets `store:false`. Provider retention remains governed by the provider, not by CapCar's reset/delete controls. No provider response bodies, keys, frames or observations are logged by this feature. Responses use no-store caching.

Saved text, timestamps, provider name and approved topic enums use the existing private garage snapshot sync under `capcar.driving-reviews.v1`. Registering its key/event also includes it in snapshot export, restore, cloud save and sign-out cleanup. No frames or original videos are persisted. Stale-owner writes and submissions are blocked, an account switch hides private content and aborts in-flight review, and unmount cancels pending work. Existing garage sync status continues to distinguish device changes from successful cloud saves.

PostHog receives only consent-aware lifecycle events (`driving_clip_prepared`, review started/completed/saved, learning changed/reset and preference approved). No footage, AI text, selected topics, user ID or car identifier is passed as event properties. Existing route sanitization and session-recording-disabled configuration remain in place.

## Provider documentation checked

- [OpenAI image inputs](https://developers.openai.com/api/docs/guides/images-vision): Responses API image content with the owner's existing configured model.
- [Claude vision](https://platform.claude.com/docs/en/build-with-claude/vision): base64 JPEG image blocks in Messages.
- [Gemini image understanding](https://ai.google.dev/gemini-api/docs/image-understanding): inline image data; reuses the existing generateContent connection/model integration.
- [Supabase getUser](https://supabase.com/docs/reference/javascript/auth-getuser) and the current changelog were reviewed. No Supabase schema, storage policy or encryption change was required.

The AI is instructed to treat text in frames as scene content, avoid identifying individuals or repeating plates/addresses, never infer sensitive traits, and not estimate speed, braking, distances or legality from stills. These instructions reduce risks; they do not make AI output authoritative. Structural validation rejects malformed results and nonexistent frame citations.

## Verification

- 61 focused tests passed across 13 files: consent and request bounds, owner mismatch, origin/auth/rate guard, provider payloads, invalid outputs and upstream failures, chronology and JPEG limits, no-evidence responses, idempotent/limited history, no raw images in storage, account snapshot lifecycle, live account-switch privacy, cancellation, language key/token parity and existing garage/SEO/analytics regressions.
- TypeScript, scoped ESLint and production build passed.
- Local Edge browser automation at 375, 768, 1024 and 1440 px completed clip selection → remove frame → consent → review → dismiss → enable learning → approve → save → personalized follow-up → disable → reset → reload → delete. Long-clip rejection and provider failure were exercised.
- Public and garage pages render the intended copy in all five languages; public routes return HTTP 200. No horizontal overflow at checked widths. Reduced-motion behavior, native keyboard controls, focus styling and confirmation dialogs were inspected.
- Two issues caught during inspection were fixed: localized introduction dispatch and sticky learning-panel clearance. The shared sidebar's reduced-motion class is now CSS-based to avoid a hydration mismatch.
- QA uses only local synthetic footage and mocked AI responses. It does not read or mutate real user records or spend API credits.

## Remaining limits

Live provider billing/model access and the quality of real footage analysis have not been tested with a user's credentials. Real Safari/iOS codec behavior and physical-device performance are unverified; mobile checks used emulated browser widths. This first version samples still frames and does not accept long trips, extract audio/telemetry, automatically redact identities or infer an entire driving style. Browser reload discards unsaved clips/results by design. Human review of translated copy is still useful before a broad launch.

No deploy was requested for this feature. Keep release copy as a preview until deployed and tested with a real owner's authorized API connection.

## Instagram deliverables

Files in `artifacts/driving-review/social/`:

- `capcar-driving-review-reel.mp4`: approximately 36 seconds, 1080×1920, H.264 at 30 fps, AAC stock synthesized narration.
- `capcar-driving-review-reel-silent.mp4`: same edit without audio, ready for a personal voiceover or licensed in-app track.
- `capcar-driving-review-post.png`: 1080×1350 feed image.
- `caption.txt`: prepared caption.

The reel uses real screenshots of this local interface, with any example advice explicitly labeled illustrative. All assets say FEATURE PREVIEW. No real recordings, personal records, fabricated performance claims, testimonials or music are used. Six scenes, fade transitions and restrained movement were rendered locally; images and video were inspected and video decoding verified. Nothing has been posted to Instagram.

Reproduction: `scripts/qa-driving-review.mjs` runs the local browser flow (requires the two generated synthetic MP4 fixtures in artifacts and Playwright). `scripts/capture-driving-review-social.mjs` captures the local UI with synthetic example content. Set `PLAYWRIGHT_MODULE` to an available Playwright installation when it is not installed in this repository. Browser automation is restricted to localhost for the QA fixtures.
