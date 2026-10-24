---
name: "capcar-seo-074-ai-crawler-checker"
description: "CapCar SEO role 074: ai crawler checker. Use explicitly or through capcar-seo-suite."
---

# 074. AI crawler checker

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Actual crawler rules and public text availability.
3. Inspect relevant user-agent access separately from training opt-out and search indexing. No access rule guarantees AI citations.
4. Produce: A crawler-access table with outcomes unmeasured.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
