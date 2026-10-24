---
name: "capcar-seo-083-local-pack-analyser"
description: "CapCar SEO role 083: local pack analyser. Use explicitly or through capcar-seo-suite."
---

# 083. Local pack analyser

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Defined eligible local business, location and observed local SERPs.
3. Record query, location, device and date. Separate workshop-directory product use from CapCar ranking as a local workshop.
4. Produce: A local SERP review or not-applicable result.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
