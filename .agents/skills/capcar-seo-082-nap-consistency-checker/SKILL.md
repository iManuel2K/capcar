---
name: "capcar-seo-082-nap-consistency-checker"
description: "CapCar SEO role 082: nap consistency checker. Use explicitly or through capcar-seo-suite."
---

# 082. NAP consistency checker

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Confirmed business entity and verified local citation sample.
3. Compare only the same entity's real published name/address/phone. Do not invent a CapCar phone or copy a workshop's local-business identity.
4. Produce: A verified consistency table or not-applicable result.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
