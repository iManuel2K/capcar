---
name: "capcar-seo-012-sitemap-auditor"
description: "CapCar SEO role 012: sitemap auditor. Use explicitly or through capcar-seo-suite."
---

# 012. Sitemap auditor

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Declared sitemap XML and independently fetched destinations.
3. Validate XML, unique canonical URLs, dates, locale alternates and destination status. A submitted sitemap is not evidence that URLs are indexed.
4. Produce: A sitemap reconciliation with precise URL counts.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
