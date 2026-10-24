---
name: "capcar-seo-093-change-logger"
description: "CapCar SEO role 093: change logger. Use explicitly or through capcar-seo-suite."
---

# 093. Change logger

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Repository diff plus actual audit actions.
3. Record only changed skill/config/report files and executed checks. Do not label recommendations as deployed product changes.
4. Produce: An exact change log and deployment state.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
