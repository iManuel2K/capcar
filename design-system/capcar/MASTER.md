# CapCar design system

Curated project rules, October 19, 2026. Use these before catalog-generated recommendations. Page overrides in `pages/` take precedence for their scope. This document records the approved direction and guides future changes; it does not assert that every legacy screen already meets every rule.

## Product and hierarchy

CapCar is a private digital garage for car enthusiasts: add a real vehicle, plan maintenance or an upgrade, set a budget, record progress and plan drives. Prioritize the next useful action. Present one primary action per section and make secondary actions quieter. Keep terminology consistent across garage, builds, maintenance, journal, Studio and Roadbook.

Use UI/UX Pro Max for focused design research, accessibility and stack guidance. Reject dealership, financing, test-drive booking or fleet-operation flows unless a future task explicitly needs them. Do not replace approved product decisions with an unreviewed generated theme.

## Visual foundation

Reuse current variables in `src/app/globals.css` and existing component styles. Do not add another font, animation framework or component library just to follow a search result.

| Role | Existing direction |
| --- | --- |
| Page | Dark teal, `--background: #0b2326` |
| Text | Warm white, `--foreground: #f5f2e8` |
| Muted text | `--muted-foreground: #aab6b1` |
| Accent | Restrained copper, `--capcar-red-soft: #bf8269`; garage uses `#d6aa92` |
| Destructive | `--destructive: #b72f3e`; accompany colour with text or an icon label |
| Form or detail surface | Existing `--card: #123033`, only where grouping helps |
| Borders | Existing subtle white borders; avoid a box around every element |
| Typography | Existing system sans-serif; monospace for compact technical data where useful |

Keep body text readable, normally 16px with comfortable line height. Use smaller captions sparingly and check them on a real screen. Reserve the strongest type size for the selected vehicle or the page's main task. Prefer a consistent 4px spacing basis and existing component spacing; do not introduce arbitrary per-page scales.

## Vehicle presentation

Show the whole car using contain framing. Use transparent cutouts or an alpha-enabled 3D canvas on the existing page background. Keep car controls, badges, explanations and ratings outside the car visual. Do not add a cream panel, image mask, gradient overlay or covering text across the car.

Preserve owner uploads. Never silently replace a trim, generation or body style with another model. Distinguish a visual reference from the owner's exact car. Expose a useful preview and retry path if 3D fails. Do not claim a single photo is a measured 360-degree model.

## Interaction and responsive layout

- Use native links, buttons and form controls with visible labels and focus indicators. Keep touch targets at least 44px and provide keyboard/touch alternatives to dragging or hover.
- Support narrow phones, tablets and desktops. Check 375px, 768px, 1024px and 1440px when device tooling is available; distinguish code review from actual device testing.
- Let translated labels, chips and headings reflow. Preserve English, German, Greek, Albanian and Japanese; do not force fixed heights or reverse direction to fit text.
- Keep the selected car, account context and unsaved edits stable during rapid interactions. Stop optional carousel cycling when users interact with vehicle or rating controls.
- Respect reduced motion. Animate position and opacity where possible; keep motion purposeful and controllable. Pause decorative media when hidden/offscreen. Load only the active 3D reference and dispose unused renderers.

## Data, forms and states

Provide useful loading, empty, error and success states. Distinguish planned budget, actual spending and estimates. Do not fabricate savings, completion or customer activity.

The seven-axis driving-character radar contains subjective owner ratings from 1–10. New owner cars start unrated. Public examples may use clearly labeled fictional values. Supply accessible labels, numeric values and non-colour indicators; preserve save, cancel and clear behaviour per vehicle.

Keep owner photos, vehicle identifiers and diagnostic/history data private through existing account controls. Do not place private data in design research queries, examples or analytics identifiers.

## Existing technical boundaries

Use Next.js, React, TypeScript, Tailwind, CSS Modules and established components. Read installed Next.js documentation as required by AGENTS.md before editing framework code. Treat catalog stack advice as a starting point, then verify against the installed version.

Preserve Leaflet/OSM Roadbook and its functional zoom, filters, routes and detail views. Preserve authentication, existing account storage/sync and real content. Visual polish does not authorize replacing working flows or adding unrelated services.

## Review workflow

1. Read the affected component, this master and its page override.
2. If the `capcar-ui-ux` skill is available, use one focused local query; inspect whether its result fits the task. Use system generation only for a new visual direction, inspect it before persisting, and retain approved decisions.
3. Implement the smallest coherent improvement. Validate contrast, focus, wrapping, interaction and empty/failure states in scope.
4. Run relevant existing checks and inspect the requested page. State limitations accurately, especially if WebGL or device emulation is unavailable.

Skill source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill at commit `56ea9cf174ed86786187daa9de0e6247cb0747e4`. The installed CapCar adapter includes the MIT license, pinned search scripts, data and references. The approved CapCar system above is manually curated; the generic automotive result was not adopted as the theme.
