---
name: "capcar-seo-suite"
description: "Run all 100 CapCar SEO workflows, or select a numbered role or division. Produce an evidence ledger and prioritized report."
---

# CapCar SEO suite

Read [the shared contract](references/contract.md) and [the 100-role registry](references/roles.json).
These are original project workflows adapted from the user's infographic labels.
No official repository or original prompt collection has been verified for that image.

## Run all

1. Confirm the target (default `https://capcar.dev`) and read repository `AGENTS.md`.
   Record the source commit and capture time. Start from existing SEO work.
2. Inspect available read-only tools and required inputs. Establish a bounded
   public inventory from robots, sitemap and HTML links. State request limits.
3. Read and apply every numbered role's `SKILL.md` in registry order, reusing
   shared evidence. A single agent may execute the workflows sequentially;
   the role names do not imply 100 independent processes. Do not treat creation
   of a status row as execution: actually perform the role's available checks
   or record the specific missing input that blocks them.
4. Record one result per role with ID, status, evidence locators, specific output,
   next action and missing data. Use `done`, `partial`, `blocked`, `not_applicable`.
   For a blocked role, show the input gate that was checked. `done` isn't a pass.
5. Deduplicate findings into a report, evidence ledger and backlog with priority,
   owner role, dependency, effort assumption and observable success check.
   Save the date-stamped results under `docs/marketing/seo-suite/` when in this repo.
6. Check that exactly IDs 1-100 have results. Report counts for each status and
   distinguish source/HTTP checks from rendered checks and account metrics.

## One role or division

Look up its number/title/division in the registry and read the exact skill path.
For example, role 087 audits hreflang; division 9 covers roles 081-090.
Preserve the same evidence rules and never imply a one-role run covered all 100.

## Discovery

All roles are project-level `.agents/skills/*/SKILL.md` files. Numbered roles
have implicit invocation disabled to avoid overlapping the existing SEO skills;
invoke them explicitly or use this coordinator. Codex can shorten or omit items
from its initial list when many skills are installed. The coordinator can read
their registry paths even then. Do not change the user's global context budget.

Run `python3 .agents/skills/capcar-seo-suite/scripts/verify.py` for structural
verification. This does not prove a particular VS Code session has discovered
the skills; verify `/skills` or `$capcar-seo-suite` in that session separately.
