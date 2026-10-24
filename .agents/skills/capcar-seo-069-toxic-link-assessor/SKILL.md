---
name: "capcar-seo-069-toxic-link-assessor"
description: "CapCar SEO role 069: toxic link assessor. Use explicitly or through capcar-seo-suite."
---

# 069. Toxic link assessor

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Real backlink evidence and any verified manual-action context.
3. Investigate specific harmful patterns; third-party toxicity labels aren't proof. Do not create or upload disavow files automatically.
4. Produce: A cautious evidence review or blocked result.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
