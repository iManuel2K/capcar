# Sound Studio launch

## What is included

150 distinct licensed engine/vehicle recordings, with original sources, creators and license links. The library spans road/performance cars, classics and motorsport; it is not a stock/aftermarket catalog for every production car. A recording's exact exhaust system and stock status are unverified unless its source documents them. No synthetic duplicates or exhaust-brand claims are included.

Users can search by car, filter by make/collection/documented cylinder count, choose either comparison slot, or load personal MP3/WAV/OGG/M4A files. Quick A/B listening uses a common start offset; only one CapCar player plays at a time. Personal files stay in the tab and are excluded from shared links. Links preserve public library choices and leave private sides empty for recipients.

Only three audio elements mount initially, all with `preload=none`. Original files are preserved, and MP3 playback copies are shipped for mobile compatibility. The recording archive loads only when opened.

## Maintaining recordings

- `src/features/visualizer/expanded-sounds.json` records the source, author, current license, original SHA-1 and collection for each imported sound.
- `node scripts/import-engine-sounds.mjs` queries Commons metadata and imports verified originals up to the configured target. It resumes from the manifest and respects source throttling. Review new vehicle metadata before publishing.
- `node scripts/prepare-engine-audio.mjs` requires ffmpeg/ffprobe on PATH, creates 128 kbps MP3 copies and measures actual durations.
- `node scripts/create-sound-studio-social.mjs` regenerates artwork using Next.js's installed Sharp dependency.
- The catalog test verifies 150 unique IDs and original checksums, file signatures, readable metadata, local MP3 files and durations. The browser verification script additionally decodes all 150 MP3s.

## Instagram package

- Feed artwork: `public/social/capcar-sound-studio-instagram.png` (1080 × 1350).
- Editable original: `public/social/capcar-sound-studio-instagram.svg`.
- Website preview: `public/social/capcar-sound-studio-share.png` (1200 × 630).
- Alt text: CapCar Sound Studio. Your stock. Your shortlist. Compare your own stock recording with a library of 150 real engine and exhaust recordings. Two listening channels, A and B, in green and warm clay.

Post after the new page is deployed:

Your camera roll has the stock clip. Your saved posts have the wish list.

Now put them side by side.

CapCar Sound Studio has 150 real recordings to explore, from road cars to classics and race cars. Add your own clip, pick another sound and switch between A and B. Your personal files stay on your device.

What car should we record next?

Search “CapCar Sound Studio” or visit capcar.dev/sound-studio.

#CapCar #ProjectCar #ExhaustSound #CarBuild #CarEnthusiast

## Release check

Validate tests and production build, run `scripts/verify-sound-studio.mjs` with Playwright available (`PLAYWRIGHT_MODULE` can point to an installed package), inspect mobile/desktop screenshots and the social images, then deploy. Recheck the live page and share image before publishing the Instagram post. No social publishing credentials are needed for the included assets.
