---
name: "capcar-seo-023-page-type-matcher"
description: "CapCar SEO role 023: page type matcher. Use explicitly or through capcar-seo-suite."
---

# 023. Page type matcher

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Query intent and existing page families.
3. Choose a product page, tool, guide, journal article or directory based on the task. Prefer improving an appropriate existing URL over duplicates.
4. Produce: An existing-page match table and justified gaps.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
