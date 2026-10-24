---
name: "capcar-seo-011-index-coverage-reader"
description: "CapCar SEO role 011: index coverage reader. Use explicitly or through capcar-seo-suite."
---

# 011. Index coverage reader

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Authorized Search Console coverage or URL Inspection results.
3. Use the exact property and inspected dates. Separate discoverability, indexability, Google-selected canonical and actual indexing; public search is insufficient.
4. Produce: A coverage table with exclusions and unresolved samples.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
