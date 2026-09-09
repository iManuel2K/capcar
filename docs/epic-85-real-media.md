# Epic 85 — Real recordings and realistic references

## Delivered

Two local engine recordings with HTML audio controls, MP3 compatibility copies, original Ogg files and visible attribution. No autoplay. These are not calibrated stock/modified comparisons.

The homepage and studio showcase now lead with a realistic Skyline R34 GT-R and Porsche 930 reference gallery. Model rendering is hosted by Sketchfab and loaded only after clicking Explore in 3D. Selection unloads the previous model. A local preview and manual retry remain available. The existing stylized sketch tool is retained, not misrepresented as a realistic configurator.

## Media licenses and provenance

- `public/sounds/honda-f20c.ogg`: Tyler Riddle, 2002 Honda F20C engine-bay recording. Original bytes unchanged. CC BY 3.0: https://creativecommons.org/licenses/by/3.0/ . Source: https://commons.wikimedia.org/wiki/File:2002-Honda-F20C.ogg . MP3 is a Capcar format conversion under the same license.
- `public/sounds/volvo-850-t5.ogg`: Jonas Tittmann, Volvo 850 T5 five-cylinder turbo. Original bytes unchanged. CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/ . Source: https://commons.wikimedia.org/wiki/File:5_cylinder_engine_sound.ogg . MP3 conversion distributed under the same license.
- Skyline model and unmodified thumbnail: Lexyc16, CC BY 4.0. https://sketchfab.com/3d-models/ff8fb2251dfa4bb9979e7022c5a6666c . Preview: `public/showcase/skyline.jpg`.
- Porsche model and unmodified thumbnail: Lionsharp Studios, CC BY 4.0. https://sketchfab.com/3d-models/8568d9d14a994b9cae59499f0dbed21e . Preview: `public/showcase/porsche.jpg`.
- Model attribution license: https://creativecommons.org/licenses/by/4.0/ . No endorsement implied. Vehicle design and trademarks remain with their respective owners. Model licenses were checked through the original creator's Sketchfab model API on 2026-09-09.

Do not remove credits when redistributing these assets. The media licenses apply to the respective assets, not unrelated application source.

## Still unfinished

Exact Fast & Furious replicas: investigated examples were game exports or non-commercial-only. They are not included as cleared commercial assets. The current Skyline is an independent model, not Brian's film livery. Self-hosted detailed GLB configurators, interactive part swaps and verified stock/modified recording pairs are not delivered by this patch. Third-party WebGL rendering and mobile visual quality still need device acceptance.

## eBay screenshot

The screenshot is an upstream search-unavailable state, not proof of a missing key specifically. Existing server code can fail on missing credentials, OAuth, API permissions, quota, timeout or response validation. This patch does not change eBay code or claim live search is fixed. Supply the current Netlify function error (redact tokens/credentials) and the latest eBay source before a targeted fix; do not share secret values.

## Installation

Install after Epic 84. Backups remain outside the project. Baseline conflicts stop before writes. No new dependencies or environment variables. Deploy the included public assets alongside the source files.
