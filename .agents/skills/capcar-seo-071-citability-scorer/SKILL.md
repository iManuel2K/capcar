---
name: "capcar-seo-071-citability-scorer"
description: "CapCar SEO role 071: citability scorer. Use explicitly or through capcar-seo-suite."
---

# 071. Citability scorer

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Inspected answer passages, attributable sources and defined rubric.
3. Review clear answers, factual specificity and source attribution qualitatively. A heuristic isn't measured AI citation probability or market share.
4. Produce: An explainable citation-readiness assessment with unknown outcomes.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
