---
name: "capcar-seo-001-technical-auditor"
description: "CapCar SEO role 001: technical auditor. Use explicitly or through capcar-seo-suite."
---

# 001. Technical auditor

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Public HTTP responses, robots, sitemap and page metadata.
3. Reconcile response status, index directives, canonical targets and crawlable text. Separate template defects from individual URLs.
4. Produce: A technical finding ledger with reproduction URLs and dependencies.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
