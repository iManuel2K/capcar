---
name: "capcar-seo-013-robots-checker"
description: "CapCar SEO role 013: robots checker. Use explicitly or through capcar-seo-suite."
---

# 013. Robots checker

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Actual robots.txt and applicable crawler user agents.
3. Parse matching allow/disallow rules separately from meta and header noindex. Verify public asset access without recommending exposure of private garages.
4. Produce: A crawler-specific rules ledger and intended access decisions.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
