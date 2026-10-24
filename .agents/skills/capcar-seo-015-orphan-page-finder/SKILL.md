---
name: "capcar-seo-015-orphan-page-finder"
description: "CapCar SEO role 015: orphan page finder. Use explicitly or through capcar-seo-suite."
---

# 015. Orphan page finder

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Sitemap, discovered public anchors and source route inventory.
3. Find indexable URLs with no observed public inlinks. Distinguish a bounded graph candidate from a proven whole-site orphan and exclude private routes.
4. Produce: An observed orphan-candidate list with graph coverage.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
