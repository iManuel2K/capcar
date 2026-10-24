---
name: "capcar-seo-055-brand-mention-finder"
description: "CapCar SEO role 055: brand mention finder. Use explicitly or through capcar-seo-suite."
---

# 055. Brand mention finder

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Public web results or a supplied mention export.
3. Disambiguate CapCar software from unrelated businesses. Record only inspected mentions and links; search results aren't a complete web census.
4. Produce: A verified mention sample or no-confirmed-mention statement.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
