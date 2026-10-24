---
name: "capcar-seo-064-broken-link-finder"
description: "CapCar SEO role 064: broken link finder. Use explicitly or through capcar-seo-suite."
---

# 064. Broken link finder

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Observed public anchors and actual target responses.
3. Fetch a bounded safe link sample; record source page, href, status and redirect destination. Untested links remain unknown.
4. Produce: A broken-link ledger with intentional errors separated.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
