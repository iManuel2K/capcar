# CapCar project skills for Codex

These four upstream packs are checked into this repository. Pulling this branch
installs their skill files for this project; there is no global skill installer,
application dependency, submodule, or postinstall step.

## Verified official sources

Verified on 2026-10-23 against the authors' GitHub repositories and their own
installation documentation, rather than a mirror or a third-party skill index.

| Pack | Official repository | Pinned commit | Included skills |
| --- | --- | --- | --- |
| Ponytail | <https://github.com/DietrichGebert/ponytail> | `09c434ab73ca43761c5d8b0c5d341926c2fba710` | All 6 skills |
| Addy Osmani Agent Skills | <https://github.com/addyosmani/agent-skills> | `aeac41d4d005999432bb7312f7ff06383a91d59d` | All 25 skills |
| Impeccable | <https://github.com/pbakaus/impeccable> | `ea69c18d9f5308a04cfffb8785670a21d522d810` | Its compiled Codex-compatible skill, command references and launcher |
| Matt Pocock Skills | <https://github.com/mattpocock/skills> | `5beb35b040e3de97e54fa9e386d7e42d15c295c2` | The 27 engineering/productivity skills listed in the upstream release manifest |

Ponytail's README explicitly identifies `DietrichGebert/ponytail` as its official
repository. Addy's Codex guide identifies `addyosmani/agent-skills`; Impeccable's
repository identifies Paul Bakaus and links to impeccable.style; Matt's README
identifies `mattpocock/skills` and links to aihero.dev. The pinned READMEs, licenses,
and Impeccable attribution notice are retained under `vendor/`.

Upstream skill files are unmodified. Relative symlinks in `.agents/skills/` point
into `.agents/vendor/`, preserving upstream layouts and shared references (notably
Addy's `../../references/` links). All targets stay inside the repository and work
with Git's normal macOS symlink support. Existing CapCar skills are preserved.
`skill-sources.json` is this project's provenance/integrity inventory, not a
Codex configuration format or a skills.sh lockfile. It records source commits,
source paths, Codex names, file hashes, and executable flags.

## macOS and VS Code

1. Open your existing CapCar folder in VS Code. Fetch and check out this PR's
   branch, or pull `master` after the PR is merged. Keep any unrelated local
   changes safe before switching branches. To check out the PR for the first time:

   ```sh
   git fetch origin
   git switch --track origin/codex/project-agent-skills
   node scripts/check-codex-skills.mjs
   ```

2. Install or update **Codex by OpenAI** in VS Code's Extensions panel and sign in.
   Use a local Codex session opened on this CapCar checkout. Start a new thread;
   if the list is stale, run **Developer: Reload Window** from VS Code's Command
   Palette. No separate skill installation is needed in the extension.

3. In Codex chat, open `/skills` or type `$` and select a skill. Useful smoke
   checks that do not request an application edit:

   ```text
   $ponytail-help
   $using-agent-skills Explain the available workflows. Do not edit files.
   $impeccable Explain your available commands. Do not run init or edit files.
   $mattpocock-skills:ask-matt Which workflow fits reviewing a small bug fix? Do not edit files.
   ```

   Other examples: `$ponytail-review`, `$spec-driven-development`,
   `$impeccable audit`, `$mattpocock-skills:tdd`.
   Codex derives Matt's `mattpocock-skills:` namespace from its retained upstream
   plugin metadata. Use the exact name shown by your installed Codex selector.

4. Optional automated discovery check: if `codex` is available in your terminal,
   run:

   ```sh
   codex --version
   node scripts/check-codex-skills.mjs --codex
   ```

   The VS Code extension has its own Codex runtime; a terminal CLI is only needed
   for this automated check. If absent, install it separately, for example
   `npm install -g @openai/codex@0.164.0`. An existing newer compatible CLI is fine.
   For a CLI in another location, use
   `node scripts/check-codex-skills.mjs --codex --codex-bin /absolute/path/to/codex`.

Codex's documented repository discovery root is `.agents/skills`, including
symlinked folders. It searches from the current working directory up to the Git
root. These are repository-scoped skills, not entries in `~/.agents/skills`.
See the [official OpenAI skill documentation](https://learn.chatgpt.com/docs/build-skills).

## Runtime setup and boundaries

- No lifecycle hooks are installed. Ponytail is available as an invoked skill;
  its plugin's automatic session injection and Claude-only band are not part of
  this portable project installation. No hook-trust approval is needed here.
- Impeccable includes its upstream executable launcher. Before first practical
  use on your Mac, run this from CapCar's root:

  ```sh
  .agents/skills/impeccable/scripts/impeccable engine-probe
  ```

  It selects Intel or Apple Silicon automatically and downloads engine `0.1.16`
  from the official `pbakaus/impeccable` release into your user cache. The launcher
  verifies the release SHA-256 sidecar before execution. This step needs network
  access and a writable cache; it does not edit CapCar's application files.
  Impeccable's browser commands may have further runtime requirements documented
  in their bundled references. Discovery does not prove every command's runtime.
- Matt's engineering workflows expect per-repo tracker, label and domain-doc
  preferences. Run `$mattpocock-skills:setup-matt-pocock-skills` once when you want
  those workflows. That separate interactive setup can write `docs/agents/`,
  change instruction files and create tracker labels. It was not run as part of
  this skill installation; the skills themselves are installed and discoverable.
- CapCar's existing `AGENTS.md` and design-system requirements still apply.
  Skills supply on-demand guidance; installation does not apply a redesign,
  run an engineering workflow, or modify application code.
- Some upstream instructions use Claude-style slash commands or other agents'
  tool names. In Codex, invoke the matching installed skill with `$` and use
  Codex's available tools. Addy's idea-refine shell helper, when explicitly
  needed, lives at
  `.agents/vendor/addyosmani-agent-skills/skills/idea-refine/scripts/idea-refine.sh`;
  its upstream example assumes the pack itself is the working directory.
- Avoid also installing these same packs globally or as marketplace plugins
  unless you want duplicate selector entries. If a skill is missing locally,
  update/restart Codex, run the check, and inspect any disabling `skills.config`
  entries in your own `~/.codex/config.toml`.

## Verification and updates

The dependency-free check validates every pinned file hash, required executable
bit, relative symlink and unique project frontmatter name. With `--codex`, it
starts Codex app-server, calls `initialize` and `skills/list` with `forceReload`,
and checks all 59 expected skills for correct paths, enabled status and `repo`
scope from both the root and `src/`. It makes no model requests and needs no API
key or application dependencies.

Validated here with Codex CLI **0.164.0**: **59/59** enabled repo skills from both
locations, no project skill parsing errors, **201** upstream files matching their
source hashes, **120** unique project frontmatter names including the existing
skills. Impeccable's Linux engine probe returned `impeccable-engine 0.1.16`.
Your actual macOS VS Code selector and macOS engine execution still need the
local checks above. Application build/tests were not run because application
code, dependencies and build settings are unchanged.

Updates are intentional and reviewed: fetch a new official source commit,
replace that pack's vendored files, preserve its layout and notices, update the
inventory hashes/paths/names, and rerun both checks before merging. This
installation does not auto-update or use `npx skills update`.

The vendor directory is excluded from automatic Prettier rewrites. Git attributes
preserve its exact line endings and upstream whitespace, including the Windows
launcher. Whitespace checks still apply to the project-authored configuration.
