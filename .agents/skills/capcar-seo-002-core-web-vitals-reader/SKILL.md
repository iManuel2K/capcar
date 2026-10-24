---
name: "capcar-seo-002-core-web-vitals-reader"
description: "CapCar SEO role 002: core web vitals reader. Use explicitly or through capcar-seo-suite."
---

# 002. Core Web Vitals reader

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Dated CrUX or Search Console CWV export; optional matching lab run.
3. Separate field LCP, INP and CLS from lab diagnostics. Preserve device, period, sample and units; do not infer CWV from HTML.
4. Produce: A measured metric table, or a blocked result naming the missing measurement.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
