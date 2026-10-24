---
name: "capcar-seo-029-zero-click-assessor"
description: "CapCar SEO role 029: zero-click assessor. Use explicitly or through capcar-seo-suite."
---

# 029. Zero-click assessor

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Observed SERP features and matching query click data.
3. Distinguish informational answers from tasks requiring CapCar. Do not infer zero-click rates from an FAQ or an AI summary screenshot.
4. Produce: Observed SERP/CTR evidence or clearly labeled exposure hypotheses.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
