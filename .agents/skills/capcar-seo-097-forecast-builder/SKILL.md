---
name: "capcar-seo-097-forecast-builder"
description: "CapCar SEO role 097: forecast builder. Use explicitly or through capcar-seo-suite."
---

# 097. Forecast builder

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Adequate historical demand, impressions, clicks and explicit assumptions.
3. Model scenarios with uncertainty only from real baselines. A newly launched app with no data cannot support a numerical forecast.
4. Produce: A transparent scenario model or blocked result.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
