---
name: "capcar-seo-014-crawl-budget-analyser"
description: "CapCar SEO role 014: crawl budget analyser. Use explicitly or through capcar-seo-suite."
---

# 014. Crawl budget analyser

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Authorized crawl stats or server logs plus URL inventory.
3. Identify repeated parameter spaces, redirect/error requests and crawl demand only from logs. Small-site URL hygiene alone is not proof of wasted crawl budget.
4. Produce: Measured crawl allocation or an explicitly limited hygiene review.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
