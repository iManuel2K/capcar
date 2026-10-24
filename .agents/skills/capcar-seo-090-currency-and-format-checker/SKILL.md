---
name: "capcar-seo-090-currency-and-format-checker"
description: "CapCar SEO role 090: currency and format checker. Use explicitly or through capcar-seo-suite."
---

# 090. Currency and format checker

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Visible dates, amounts and locale-specific examples.
3. Check currency units, decimal/grouping/date conventions and illustrative labels. Don't convert assumed example budgets into live prices.
4. Produce: A locale formatting review and bounded sample notes.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
