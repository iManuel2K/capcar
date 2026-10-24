---
name: "capcar-seo-079-faq-coverage-checker"
description: "CapCar SEO role 079: faq coverage checker. Use explicitly or through capcar-seo-suite."
---

# 079. FAQ coverage checker

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Actual user objections, page answers and product prerequisites.
3. Check that common account, cost, fitment, privacy and availability questions are answered. Do not add FAQ markup for a promised rich result.
4. Produce: A question-to-answer map with genuinely missing questions.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
