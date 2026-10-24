---
name: "capcar-seo-021-keyword-clusterer"
description: "CapCar SEO role 021: keyword clusterer. Use explicitly or through capcar-seo-suite."
---

# 021. Keyword clusterer

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Supplied keyword list or labeled task-derived seed queries.
3. Group queries by user task and existing landing page. Use real SERP overlap when available; do not invent volume, difficulty or demand.
4. Produce: A query-to-page cluster table labeled as measured or hypothetical.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
