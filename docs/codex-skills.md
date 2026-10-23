# Codex project skills

The four requested upstream packs are checked into `.agents/skills/`. A normal Git checkout installs them for this project; no global skill installation, submodules, or application dependencies are needed. The existing 61 skill folders and their `skills-lock.json` entries are unchanged.

## Verified official sources

Verified on 2026-10-23 against the authors' GitHub repositories, upstream READMEs and installation instructions, not third-party mirrors or similarly named forks.

| Pack | Official repository | Pinned commit | Installed skills |
| --- | --- | --- | --- |
| Ponytail | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | `09c434ab73ca43761c5d8b0c5d341926c2fba710` | 6 |
| Addy Osmani Agent Skills | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | `aeac41d4d005999432bb7312f7ff06383a91d59d` | 25 |
| Impeccable | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | `ea69c18d9f5308a04cfffb8785670a21d522d810` | 1, with command playbooks |
| Matt Pocock Skills | [mattpocock/skills](https://github.com/mattpocock/skills) | `5beb35b040e3de97e54fa9e386d7e42d15c295c2` | 27 |

The install contains **59 new skills**, 120 project skill folders in total. Matt's pack contains the published `skills/engineering/` and `skills/productivity/` sets listed in his README. Experimental `in-progress` and miscellaneous Claude-specific/setup utilities are outside that published set.

All upstream files are copied byte for byte. `.agents/skills-sources.lock.json` records every installed file's source path, source commit, SHA-256 and executable mode. License texts and Impeccable's third-party notice are under `.agents/licenses/`. Addy's shared checklists are under `.agents/references/`, preserving the skills' `../../references/` links. Ponytail Gain's cited benchmark is included in its skill folder.

## macOS and VS Code

The installation is merged into `master`. From your existing CapCar checkout:

```bash
git fetch origin
git switch master
git pull --ff-only
node .agents/tools/verify-skills.mjs
```

If Git reports local changes, commit or stash your own work before switching branches.

1. Open the **CapCar repository folder** in VS Code.
2. Install or update **Codex by OpenAI** (`openai.chatgpt`), recommended in `.vscode/extensions.json`. Sign in if needed. With the VS Code `code` command installed, you can use `code --install-extension openai.chatgpt`. If `code` is missing, use the Extensions view, or run **Shell Command: Install 'code' command in PATH** from the macOS Command Palette.
3. Start a new local Codex chat in this workspace. If it was already open, use **Developer: Reload Window** and start a new chat.
4. Run `/skills` or type `$` in Codex and check for `ponytail`, `using-agent-skills`, `impeccable`, and `ask-matt`. Use the Codex sidebar, not Copilot Chat.

OpenAI documents [repository discovery in `.agents/skills`](https://developers.openai.com/codex/skills/) and the [Codex IDE extension](https://developers.openai.com/codex/ide/). Codex scans from its working directory up to the repository root. Large inventories can shorten or omit descriptions from the initial model context; explicitly select the skill when needed.

No settings in your personal `~/.codex/config.toml` need changing. Do not install the same packs globally or as plugins on top of this checkout: that can create duplicate skill choices. The upstream help files sometimes describe namespaced plugin commands or `/slash` commands; these plain project skills use their unnamespaced `$skill-name` in Codex.

## Use the skills

| Goal | Example Codex prompt |
| --- | --- |
| Keep an implementation small | `$ponytail full` followed by your task |
| Review a change | `$ponytail-review review my current diff` |
| Addy's engineering workflow | `$using-agent-skills choose the right workflow for this task` |
| Plan an implementation | `$planning-and-task-breakdown plan this change` |
| Review UI without editing | `$impeccable critique the homepage; report only, do not edit files` |
| Choose Matt's workflow | `$ask-matt which skill should I use for this bug?` |
| Test-driven implementation | `$tdd implement this agreed change` |

CapCar's `AGENTS.md`, `design-system/capcar/MASTER.md` and page overrides remain authoritative. Generic skill preferences do not authorize replacing CapCar's approved visuals or changing the requested scope.

Matt's `$setup-matt-pocock-skills` is installed for first-use setup of issue tracker, triage labels and domain-document conventions. Run it when you want those workflows configured; it asks for your preferences before writing. This installation does not run that separate interactive workflow or create GitHub labels. Ordinary skills such as `$tdd` and `$codebase-design` are discoverable immediately.

Impeccable's `$impeccable init` captures product context; run it when you want to create that context. It was not run during this installation, so no product/design files or UI were generated.

## Impeccable engine on macOS

The complete upstream Codex skill includes its launcher, references and scripts. The launcher's `VERSION` pins the engine to **0.1.16**. Before the first design task, you can install and check the engine in an ordinary Terminal session:

```bash
.agents/skills/impeccable/scripts/impeccable engine-probe
```

Expected output: `impeccable-engine 0.1.16`. It selects Apple Silicon or Intel automatically, downloads from the official `pbakaus/impeccable` GitHub release, verifies the SHA-256 sidecar and caches the executable under `~/.impeccable/bin/0.1.16/`. Both Darwin architectures and checksum assets were verified in the release metadata. This needs network access and permission to write the cache. No engine binaries are committed to CapCar.

This is the project skill installation. Ponytail's plugin session hooks, Claude band/board, Impeccable's automatic edit hooks/live browser setup and plugin auto-updates are not installed. The skill prompts and Impeccable command playbooks are available. Addy's Claude lifecycle aliases such as `/build` are not registered as Codex commands; invoke their underlying skills by name.

## Verify with Codex's real loader

The first command below checks installed file hashes, executable bits, presence and project skill name uniqueness. The second additionally starts a local Codex app server and requests `skills/list` with `forceReload: true`, checking every new skill's exact path, enabled state and `REPO` scope from both the repository root and `src/`. It does not start a model turn, send application source to a model, or require API credits.

```bash
node .agents/tools/verify-skills.mjs
node .agents/tools/verify-skills.mjs --codex
```

The second command needs a `codex` executable on PATH. The VS Code extension can use the project skills without a separately installed CLI. For the terminal verification only, install the official CLI if needed:

```bash
npm install --global @openai/codex
codex --version
node .agents/tools/verify-skills.mjs --codex
```

Alternatively, `CODEX_BIN=/absolute/path/to/codex node .agents/tools/verify-skills.mjs --codex` selects an existing binary.

Validated in the installation environment with Codex CLI **0.159.2**, Node **24.19.0**, Linux, and rechecked after PR #79 with Codex CLI **0.164.0**:

- All **59/59** additions were discovered, enabled and reported at `REPO` scope by Codex, with no project loader errors.
- All **192** installed upstream files matched their recorded hashes; the launcher retained its executable bit.
- All 120 project skill folders had unique names. Codex 0.164.0 discovered all 61 pre-existing skills by their project paths. It displays `humanizer` as `humanizer:humanizer`, so the verifier matches existing skills by path to avoid a false missing-skill report. Its files are unchanged.
- All 24 checked Addy shared-reference links resolved.
- The Impeccable engine downloaded, passed checksum verification and returned `impeccable-engine 0.1.16`.
- Node syntax and launcher shell syntax passed. Isolated negative checks rejected altered content, missing files and duplicate skill names.

Your Mac's running VS Code session cannot be inspected remotely here; the `/skills` check above completes verification in your actual extension session. Application build/tests were not run because no application files, package manifests or dependency locks changed.

## Updates

These four packs use `.agents/skills-sources.lock.json`; the older `skills-lock.json` continues to describe CapCar's existing skills. Do not run a bulk formatter or `npx skills update` over these four pinned copies: it can change upstream content or omit Addy's shared references.

To update, fetch the official source, select and review a new commit, replace only the files owned by that source, preserve licenses/references/modes, and regenerate that source's lock entries. Keep upstream `agents/openai.yaml` policies, including Matt's explicit-invocation settings. Re-run both verification commands and review the diff in a PR. Do not update CapCar application code as part of a skill update.
