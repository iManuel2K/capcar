---
name: "capcar-seo-046-image-optimiser"
description: "CapCar SEO role 046: image optimiser. Use explicitly or through capcar-seo-suite."
---

# 046. Image optimiser

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Actual image purpose, markup, delivery parameters and optional measurements.
3. Distinguish decorative and informative images, inspect sizing/loading and meaningful text alternatives. CSS fill images don't require invented dimensions.
4. Produce: An asset-level recommendation list with performance hypotheses labeled.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
