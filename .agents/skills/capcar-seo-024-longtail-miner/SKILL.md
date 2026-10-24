---
name: "capcar-seo-024-longtail-miner"
description: "CapCar SEO role 024: longtail miner. Use explicitly or through capcar-seo-suite."
---

# 024. Longtail miner

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Product tasks, vehicle context and optional real query export.
3. Derive specific user questions from actual CapCar workflows. Keep vehicle variants explicit and mark unmeasured phrases as seed hypotheses.
4. Produce: A bounded longtail backlog without fabricated search metrics.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
