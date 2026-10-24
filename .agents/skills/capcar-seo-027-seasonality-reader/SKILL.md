---
name: "capcar-seo-027-seasonality-reader"
description: "CapCar SEO role 027: seasonality reader. Use explicitly or through capcar-seo-suite."
---

# 027. Seasonality reader

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: At least one suitable seasonal time series with locale and dates.
3. Separate seasonality from launch, deployment and short-window effects. Do not forecast seasonal peaks from automotive intuition.
4. Produce: A measured seasonal pattern or blocked result.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
