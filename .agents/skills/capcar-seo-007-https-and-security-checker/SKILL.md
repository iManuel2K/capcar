---
name: "capcar-seo-007-https-and-security-checker"
description: "CapCar SEO role 007: https and security checker. Use explicitly or through capcar-seo-suite."
---

# 007. HTTPS and security checker

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: TLS-validated public responses and resource references.
3. Verify observed HTTPS host behavior, mixed-content references and relevant headers. Do not translate a header checklist into a ranking penalty.
4. Produce: Observed transport findings and user-facing implications.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
