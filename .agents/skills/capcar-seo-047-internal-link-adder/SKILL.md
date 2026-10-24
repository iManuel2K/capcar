---
name: "capcar-seo-047-internal-link-adder"
description: "CapCar SEO role 047: internal link adder. Use explicitly or through capcar-seo-suite."
---

# 047. Internal link adder

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Existing pages and inspected relevant destinations.
3. Suggest contextual links that continue the task, with useful anchors. Verify destinations before proposing them and avoid duplicate navigation filler.
4. Produce: Specific source-section-to-target placements.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
