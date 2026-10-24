---
name: "capcar-seo-039-content-decay-finder"
description: "CapCar SEO role 039: content decay finder. Use explicitly or through capcar-seo-suite."
---

# 039. Content decay finder

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Comparable page-level performance periods and change history.
3. Separate measured deterioration from launch effects, tracking changes and low sample sizes. Missing historical data cannot prove decay.
4. Produce: A measured decay shortlist or a blocked diagnosis.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
