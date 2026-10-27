# Homepage Roadbook style gallery

The homepage now introduces all nine existing Roadbook basemap styles with a hover-expand gallery, inspired by [Unlumen Hover Expand](https://ui.unlumen.com/components/hover-expand). It uses the existing Obsidian Chrome tokens and Motion dependency. The hero, navigation, garage and global styles are unchanged.

## Behavior

- Mouse hover, keyboard focus and tap select a style. Arrow keys, Home and End move between styles. Hover does not override visible keyboard focus.
- Each preview links to `/roadbook?style=<id>`. The map validates the requested style against the existing catalog before using it; invalid values fall back to the saved preference or default.
- All five supported languages have gallery copy, loading/error messages and image descriptions.
- Reduced-motion preferences remove the spring animation. Inactive panels are inert and hidden from assistive technology.
- Only the first preview is mounted initially; remaining images mount when selected. The gallery does not import Leaflet, request map tiles or access vehicle records.

## Authentic preview images

`public/previews/roadbook-styles/` contains nine JPEG captures of CapCar's real vector map renderer. All use the same European view at 1200 × 600 so visitors can compare the palettes directly. These are static basemap previews, not live places or route results. The gallery states this and retains OpenStreetMap, OpenFreeMap and OpenMapTiles attribution.

To refresh previews after changing map palettes, run the local app on port 3127 and run `node scripts/capture-roadbook-style-previews.mjs`. The script needs Playwright with Microsoft Edge installed; `PLAYWRIGHT_MODULE` can point to a bundled Playwright installation. `ROADBOOK_PREVIEW_URL` overrides the local URL. Review the resulting images and `provenance.json` before committing.

## Verification

- 34 focused tests passed across the gallery, marketing landing, map styles and theme switcher.
- Scoped ESLint, TypeScript and the production build passed.
- Browser checks passed at 320, 375, 414, 768, 1024 and 1440 pixels, plus every supported language on mobile.
- Browser checks verified tap, hover, normal spring motion, reduced motion, keyboard focus, all nine decoded images, style handoff to Roadbook, no horizontal overflow, no browser errors and no live map tile requests on the homepage.

Run `node scripts/qa-roadbook-style-gallery.mjs` against the local app to repeat browser checks. Reports and screenshots are written to the ignored `artifacts/roadbook-style-gallery/` directory. Gallery captures can include the existing fixed header when it overlaps the screenshot viewport.

The previews need regeneration when their underlying palettes change.
