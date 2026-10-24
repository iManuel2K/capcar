---
name: "capcar-seo-005-javascript-rendering-checker"
description: "CapCar SEO role 005: javascript rendering checker. Use explicitly or through capcar-seo-suite."
---

# 005. JavaScript rendering checker

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Raw HTML plus rendered browser DOM for representative templates.
3. Compare headings, main text, links, robots, canonicals and JSON-LD before and after rendering. Raw content alone cannot establish hydration success.
4. Produce: A raw-versus-rendered comparison or explicit rendering gap.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
