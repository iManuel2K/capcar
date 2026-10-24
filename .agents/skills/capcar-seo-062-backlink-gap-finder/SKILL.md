---
name: "capcar-seo-062-backlink-gap-finder"
description: "CapCar SEO role 062: backlink gap finder. Use explicitly or through capcar-seo-suite."
---

# 062. Backlink gap finder

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Comparable competitor and CapCar backlink datasets.
3. Identify relevant referring-domain differences without assuming every competitor link is desirable. Keep date/provider scopes aligned.
4. Produce: A qualified gap shortlist or blocked result.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
