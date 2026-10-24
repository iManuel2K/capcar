---
name: "capcar-seo-006-mobile-parity-checker"
description: "CapCar SEO role 006: mobile parity checker. Use explicitly or through capcar-seo-suite."
---

# 006. Mobile parity checker

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Matching desktop/mobile rendered pages and viewports.
3. Compare primary content, metadata, schema and usable navigation at both viewports. Distinguish source parity from visual and interaction parity.
4. Produce: A viewport-specific parity ledger with reproducible differences.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
