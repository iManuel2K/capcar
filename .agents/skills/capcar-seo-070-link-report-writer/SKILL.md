---
name: "capcar-seo-070-link-report-writer"
description: "CapCar SEO role 070: link report writer. Use explicitly or through capcar-seo-suite."
---

# 070. Link report writer

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Verified internal-link checks and supplied external-link evidence.
3. Separate the measured public graph from unknown backlink coverage. Report actions, scope, dates and data gaps without invented totals.
4. Produce: A concise internal/external link report.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
