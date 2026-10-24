# CapCar: 100 SEO workflows

This project includes 100 numbered SEO skill workflows and a coordinator,
`capcar-seo-suite`. They cover the ten divisions in the user-supplied
**100 Claude Agents for SEO** infographic. Each has its own input gate,
checks and deliverable. They are original CapCar adaptations of the labels,
not the original author's prompts or an official Anthropic package.

No installable official source could be verified for the screenshot: it has no
repository URL or prompt bodies. Public searches found social reposts, which
do not establish an official installable source or license. No unrelated
repository was substituted. Existing third-party skills and `skills-lock.json`
are preserved; this local suite is not managed by `npx skills`.

## Use in VS Code on macOS

After this PR is merged, from your existing CapCar checkout:

```sh
git switch master
git pull --ff-only origin master
python3 .agents/skills/capcar-seo-suite/scripts/verify.py
node .agents/tools/verify-skills.mjs
```

Alternatively, to review before merge, fetch and switch to the PR's head branch
shown on GitHub. Save or commit unrelated local work before switching branches.

Open the **repository root** in VS Code and start a new Codex task. Run `/skills`
or type `$capcar-seo-suite`. If it does not appear, restart Codex (or use VS Code's
**Developer: Reload Window**) and try again. No global install or `sudo` is needed.

Prompt:

> $capcar-seo-suite Run all 100 workflows on https://capcar.dev. Inspect live
> evidence, reuse the existing SEO work, mark missing inputs honestly, and save
> the dated report and complete role ledger. Audit only; do not change app code.

For one role:

> $capcar-seo-087-hreflang-auditor Check the five languages and x-default.

The numbered roles have implicit invocation disabled to avoid competing with
the existing SEO skills. Explicit invocation and the coordinator remain usable.
Codex may shorten or omit skill descriptions from its initial list when many
skills exist. Use the coordinator's registry lookup for any omitted role.
See [OpenAI's discovery and context-budget documentation](https://learn.chatgpt.com/docs/build-skills).
No global or project context-budget override is introduced.

## Verification and limits

`verify.py` checks all 100 role IDs, the coordinator, frontmatter, names,
references, invocation policies and name collisions with existing skills.
With `--results docs/marketing/seo-suite/2026-10-23-results.json` it also checks
complete role coverage and missing-input explanations. It does not launch Codex
or prove discovery in your Mac's current VS Code session. That final check is local.

Skill files are instructions, not API connections, a crawler service, 100 running
processes, or an SEO subscription. The complete run can be performed sequentially
in one Codex session using shared evidence. Some roles require account exports,
backlink history or repeated AI observations; others do not apply to a software
app. An honest full run includes those dispositions rather than fake passes.

Search Console/analytics authorization is separate. Read-only exports are also
usable. No credentials are stored in these files, no paid provider calls are
configured, and no recurring automation is installed.

## Contents

- [100-role registry](../../../.agents/skills/capcar-seo-suite/references/roles.json)
- [Evidence contract](../../../.agents/skills/capcar-seo-suite/references/contract.md)
- [Initial audit](2026-10-23-report.md)
- [Every role's result](2026-10-23-results.md)
- [Machine-readable results](2026-10-23-results.json)
- [Public crawl baseline](2026-10-23-baseline.json)

Application code, runtime dependencies, global Codex settings and pre-existing
skills are outside this installation's changes.

Publication validation also ran the existing project app-server verifier with
the official temporary Codex CLI 0.164.0. All 221 project skills, including this
suite, were discovered and enabled from both the repository root and `src/`.
To repeat with a local Codex executable, use
`node .agents/tools/verify-skills.mjs --codex`; see `docs/codex-skills.md`
for `CODEX_BIN` when the executable is not on PATH. Your Mac session still needs
to load the updated checkout.
