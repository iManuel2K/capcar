---
name: "capcar-seo-010-technical-diff-watcher"
description: "CapCar SEO role 010: technical diff watcher. Use explicitly or through capcar-seo-suite."
---

# 010. Technical diff watcher

Custom CapCar workflow based on a role label in the user-supplied infographic.
This is an original project adaptation, not an official Claude/Anthropic agent.

1. Read [the shared contract](../capcar-seo-suite/references/contract.md).
2. Use these inputs: Two comparable technical snapshots and deployment refs.
3. Align URL forms, capture method and scope, then compare status, directives, metadata and graph changes. Do not compare unlike samples as a regression.
4. Produce: A dated technical delta table or missing-baseline result.
5. Record this role's ID, status (`done`, `partial`, `blocked`, or `not_applicable`),
   evidence, conclusion, next action and missing inputs. `done` means the workflow
   completed at its stated scope; it is not an SEO pass or a ranking guarantee.
   With a missing indispensable input, record `blocked` and name it; never fill
   the gap with invented metrics. Use [the registry](../capcar-seo-suite/references/roles.json)
   when contributing to a full suite run.
