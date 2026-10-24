---
name: "capcar-seo-035-anti-slop-editor"
description: "CapCar SEO role 035: anti-slop editor. Use explicitly or through capcar-seo-suite."
---

# 035. Anti-slop editor

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Selected page text and supported product facts.
3. Remove vague promises, repeated filler and awkward language while preserving useful caveats and voice. AI detector scores cannot establish authorship.
4. Produce: A concise before/after copy proposal with reasons.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
