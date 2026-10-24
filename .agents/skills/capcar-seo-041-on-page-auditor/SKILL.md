---
name: "capcar-seo-041-on-page-auditor"
description: "CapCar SEO role 041: on-page auditor. Use explicitly or through capcar-seo-suite."
---

# 041. On-page auditor

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Rendered or source main content, metadata, headings and links.
3. Assess title, description, heading purpose, content fit, internal links and relevant schema. Record source/rendered limits and repeated templates.
4. Produce: A page-level finding ledger tied to specific URLs.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
