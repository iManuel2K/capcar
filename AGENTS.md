<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## CapCar UI/UX

For CapCar interface design, reviews and visual fixes, use the `capcar-ui-ux` skill when available. It contains UI/UX Pro Max's local search tools with CapCar-specific guidance.

Read `design-system/capcar/MASTER.md` and the relevant `design-system/capcar/pages/` override before changing UI. Preserve the approved transparent garage, whole-car visuals, existing typography/palette, language support and working account behaviour. Treat generated catalog advice as recommendations, not permission to replace those decisions. Keep the Next.js documentation requirement above.

## Project agent skills

Ponytail, Addy Osmani's Agent Skills, Impeccable, and Matt Pocock's published engineering/productivity skills are installed in `.agents/skills/`. Use the matching skill when relevant; invoke one explicitly with `$skill-name` in Codex. Project instructions and the CapCar design system above take precedence over generic skill advice. These are project skill files; plugin hooks and automatic updates are not installed.

See `docs/codex-skills.md` for macOS/VS Code setup, verification, scope, and pinned upstream sources. Do not overwrite these packs with a global/plugin installation or an unreviewed bulk skills update.
