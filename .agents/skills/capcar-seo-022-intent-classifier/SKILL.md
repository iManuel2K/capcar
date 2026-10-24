---
name: "capcar-seo-022-intent-classifier"
description: "CapCar SEO role 022: intent classifier. Use explicitly or through capcar-seo-suite."
---

# 022. Intent classifier

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Actual page copy and defined queries/locale.
3. Classify learning, tool use, comparison and navigation intent. Check the next task rather than relying on a keyword label alone.
4. Produce: Intent and journey mapping with ambiguous cases.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
