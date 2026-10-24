---
name: "capcar-seo-028-brand-vs-non-brand-splitter"
description: "CapCar SEO role 028: brand vs non-brand splitter. Use explicitly or through capcar-seo-suite."
---

# 028. Brand vs non-brand splitter

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Search query export and a documented CapCar alias rule.
3. Classify brand terms and ambiguities; sum clicks/impressions and recompute CTR. Keep hidden queries and aggregation limits visible.
4. Produce: A reproducible branded/non-branded metric split or missing-data result.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
