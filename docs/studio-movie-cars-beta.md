# Sound Studio and Movie Cars — beta handoff

## Pages

- `/sound-studio`: five local, attributed real engine recordings; searchable listening desk; two distinct catalogue samples for A/B; personal stock/modified uploads; browser-local archive with metadata, audio and JSON downloads.
- `/movie-cars`: the existing Brian’s R34 fan reference and two independent design references, consolidated into one opt-in 3D viewer with orbit, zoom, tint, reset and local view saving. Accessible preview and original-source link remain available if the external viewer fails.
- Both features are linked from the public navigation and each other; Movie Cars is in the public sitemap. New feature copy is translated into all five supported languages.

## Media provenance

The two original recordings and Skyline/Porsche references retain the credits in `epic-85-real-media.md`. Three additional catalogue recordings are now served locally, with original Ogg bytes and MP3 compatibility conversions:

| Asset         | Creator / license               | Original source                                                  | Ogg SHA-1                                |
| ------------- | ------------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| nissan-vq35hr | TTTNIS / Public domain          | https://commons.wikimedia.org/wiki/File:NISSAN_VQ35HR_engine.ogg | d873ebdc254821c89d7fee339accdaf9eaae8383 |
| triumph-i6    | James Lewis / CC BY-SA 3.0      | https://commons.wikimedia.org/wiki/File:Triumph-I6_engine.ogg    | 3a14d21601493a75174f0c2949cf8e793c2cedd8 |
| slant-six     | Scheinwerfermann / CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:225_Slant_Six.ogg        | dd02caf7e5c940f55a61de51591ddbd6e332cd0a |

The Brian’s R34 reference and preview were already in the application: DRIVER-FIRE, model `c424e4f18c9742d296920f069d139b45`, previously attributed CC BY 4.0. This update retains that attribution; it does not claim fresh verification of the external model license or an official film partnership. The gallery distinguishes fan-film and design references. It makes no screen-used authenticity claim.

Recordings are general references, not exact fitment or sound predictions. MP3 conversions preserve the corresponding source license. Keep creator, source and license links with redistributed media.

## Persistence and playback

Personal recordings remain in IndexedDB on this browser/device, separate from Garage account sync. Clearing browser data removes them. Twenty-recording capacity is enforced inside one read/write transaction; audio files are limited to 30 MB each. Users must supply vehicle context and recording rights. Object URLs are revoked when no longer needed.

Playback requires a user gesture. Players start at 25% where browser controls permit and preserve later user volume changes. Starting one CapCar recording pauses other CapCar players. Closing the catalogue comparison pauses its hidden players. MP3 playback falls back to original Ogg, with a visible retry on failure.

## Verification and remaining acceptance

Production build, TypeScript, lint, full unit suite and production HTTP checks passed during this work. Both pages returned HTTP 200; the three added MP3 files returned HTTP 206 for byte-range requests.

Actual Sketchfab availability/WebGL rendering, touch controls and native audio behavior on Safari/iOS still need device acceptance. Unit coverage exercises readiness, timeout/retry, stale callbacks, material preservation, saved view validation, storage errors, playback cleanup and upload validation. No cloud database migration or new API key is required.

This change does not provide downloadable detailed car models, interactive part swaps, verified matching stock/modified recording pairs, or a cloud recording archive.
