# Capcar Epics 66–69 — Stylized Concept Studio

Approved scope: stylized generic cars, not licensed BMW replicas. This is a focused delta for the supplied Capcar source with earlier beta packages through Epic 64. Epic 65's real-user beta feedback remains separate.

## Included

- 66: reusable Three.js renderer, on-demand loading, capped 1.5 device pixel ratio, render-on-change, resize handling, camera buttons, model request cancellation, resource cleanup and retry/error messaging.
- 67: homepage concept lab and dedicated `/studio`, preserving existing photography and garage functionality.
- 68: four paint colors, stock/sport body height and the sports sedan's mapped spoiler. Two Kenney generic models, packaged locally with their CC0 license.
- 69: three original cinema-inspired presets. No film names, logos, manufacturer affiliation or replica claims.

Configurations last only while this page is open. They do not update Supabase or saved garage builds. Wheels, brakes, bumpers, interiors, exact movie replicas, engineering accuracy and part fitment are outside this delivered scope. On a device without WebGL, configuration controls remain usable, but there is no rendered 3D preview.

## Installation

Extract the ZIP outside E:\capcar, then run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\install.ps1" -ProjectPath "E:\capcar"
```

The installer checks all payload hashes and existing-file baseline hashes before writing, tolerates Windows CRLF line endings, refuses changed overlapping files and linked targets, and backs up overwritten files into E:\.capcar-installer-backups. It always installs locked dependencies unless explicitly passed -SkipChecks. No backup folders, dependencies, build output or environment files are included.

If baseline validation fails, do not force overwrites: compare the named payload file with your current version and merge the change. This snapshot cannot prove that later GitHub changes are compatible.

To recover: copy the backup's `files` contents to the project, review `created-files.txt` before removing any newly installed files, then run pnpm.cmd install --frozen-lockfile. No automated deletion is performed.

## Verification and release gate

Automated checks: Prettier, ESLint, TypeScript, 118 tests in 53 files and production build. The test browser could not reach the local preview (ERR_BLOCKED_BY_CLIENT); local HTTP smoke requests also failed to connect. PowerShell is unavailable in this Linux workspace, so the installer was reviewed but not executed here.

Before public release, verify on desktop and a real phone:

1. Homepage photography is unchanged; no 3D loads until Load interactive 3D is pressed.
2. Both models render, all four paints affect body panels only, glass/lamps/tires remain intact.
3. Camera buttons, drag rotation, stock/sport height and sedan spoiler visibly work.
4. All three presets select the intended model and configuration; Reset restores defaults.
5. Stop 3D releases the viewer; Retry and switching models work under slow/offline conditions.
6. Keyboard focus, screen-reader labels, portrait widths and page scrolling remain usable.
7. Run pnpm.cmd smoke:production -- https://capcar-im.netlify.app after deployment.

Do not treat the package as visually certified or a complete real-vehicle configurator until these checks are done.

Asset source: https://kenney.nl/assets/car-kit — Kenney Car Kit, CC0. See payload/public/models/concepts/LICENSE.txt.
