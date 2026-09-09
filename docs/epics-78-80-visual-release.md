# Epics 78–80 — Visual release increment

Based on the reconstructed Epic 77 source, not a freshly fetched GitHub checkout.

## Delivered

- 78: Existing local CC0 model renderer now has a compact control row, a generic static silhouette before activation, and explicit save/restore for browser-local visual directions. The homepage inherits the compact renderer. Garage links to the collection in both empty and populated states; existing photo/reel behavior is retained.
- 79: Three original cinema-inspired showcase directions with selectable concepts, illustrative budget ranges, parts-search links and proposed build sequences. They are not movie replicas, actual completed installations or verified fitment recommendations.
- 80: IndexedDB-backed private recording library, source-permission declaration, engine/exhaust/intake/cold-start categories, stock/modified setup labels, filtering, removal, conservative playback volume, mutually exclusive audio playback and decoding/storage errors. Existing temporary A/B comparison remains available.

## Deliberate limits

No new model assets, exact movie cars, publicly licensed sound recordings, loudness normalization, transcripts, public audio hosting, or cloud audio synchronization are included. Recording permissions are owner declarations, not independently verified licenses. Files stay on this browser, separate from account exports and deletion; clearing site data removes the library. Keep original files. Maximum 20 recordings, 30 MB each.

This is an incremental implementation of 78–80, not completion of every aspirational Phase 3 item. Real recording acquisition and visual QA remain outstanding.

## Owner acceptance

1. Open /studio on desktop and mobile. Swipe the concept selector; change paint, stance and spoiler; load 3D and use camera controls.
2. Save a direction, reload, restore. A malformed saved value must show a recovery message.
3. Confirm homepage controls remain usable and Garage photos/reel work unchanged.
4. Open /sound-studio. Add matching stock and modified files with context and permission checked; reload and verify persistence.
5. Filter categories, play two recordings (only one plays), remove a local copy, try an unsupported/oversized file and a browser with storage disabled.
6. Run format, lint, TypeScript, tests and production build locally. New showcase regression tests are supplied but not executed here, per owner request.

No credentials, migrations or dependencies are added. Do not install while a Git rebase is active. Installer backups remain outside the repository. Modified-file conflicts stop installation by default; merge them rather than lose later changes.
