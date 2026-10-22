# CapCar: 30 days of useful organic discovery

Prepared 22 October 2026. Free channels only. This is a prioritized plan, not twelve automatically generated or published articles. Work estimates below are founder-time estimates, not measured production times or traffic forecasts.

## Audience, promise and activation

Primary audience: owners maintaining a daily driver or planning a manageable project, currently using notes, receipts, retailer tabs and spreadsheets. Start with the car they already own. Public guides and previews give value before asking for an account. The first durable success is adding a real vehicle and saving one maintenance task, build item or history record. A map view, pageview or signup alone does not establish that success.

Code-verified claims are in [the SEO audit](seo-audit.md). Garage is free during beta and saving uses an account. Studio explores reference models and supported colors; Sound Studio compares recordings and own local audio. Neither proves modification suitability. Roadbook is public. Own AI itineraries require an account and a connected AI service; provider charges may apply. The example catalog is illustrative; connected retailer availability depends on the provider. Avoid claims of guaranteed fitment, certified history, quantified savings, broad workshop coverage or permanently free AI.

## Research and what CapCar should add

Research checked 21–22 October 2026. Search observations are directional; no paid keyword data, volume estimates or rank positions are available. Results can vary by location and engine.

- Maintenance-log searches surface downloadable tables and instructions. [Vertex42](https://www.vertex42.com/ExcelTemplates/vehicle-maintenance-log.html) provides service/mileage/cost fields and a spreadsheet; [Carvico](https://mycarvico.com/guides/car-maintenance-spreadsheet) provides separate fuel/service CSVs and migration guidance; [Trackara's result](https://trackara.app/car-maintenance-log) advertises printable/spreadsheet versions, but its full page was unavailable to the text tool. CapCar's addition should be an original, redacted job progressing from planned work to completed history, with corrections and privacy choices. Do not copy their templates or imply CapCar imports their files.
- Owners describe fragmented parts, budgets and progress in [this 2025 projectcar discussion](https://www.reddit.com/r/projectcar/comments/1l0c9kh/) and [a March 2026 planning discussion](https://www.reddit.com/r/projectcar/comments/1rpa3oo/how_do_you_guys_plantrack_your_builds/). These are qualitative examples, not representative survey results. Use their practical vocabulary; do not infer market size.
- Budget searches surface [Reborn's expense-tracker page](https://www.rebornbuilds.com/features/expense-tracking) and [CarJourney's project-budget guide](https://carjourney.io/blog/project-car-budget). Search extracts discuss categories and receipts; full page retrieval was limited. CapCar can add one reconciled example showing planned, purchased and installed states, delivered cost and correction after a return. Verify current competing pages manually before drafting a new flagship.
- Parts searches surface [Honda Parts Now's lookup help](https://www.hondapartsnow.com/service/honda-help_center-parts_questions-how_to_find_parts_and_verify_fitment.html), [Tasca's compatibility guidance](https://www.tascaparts.com/part-compatibility-part-fitment-and-part-availability) and [WParts' research workflow](https://wparts.com/en/how-to-find-car-part-by-vin). CapCar can add a documented decision log from initial reference to seller confirmation, including an explicitly unresolved case. Use [GM's own parts FAQ](https://parts.gmparts.com/content/dam/gm-ecommerce/site-utility/documents/GMGenuine_ACDelco_Store_FAQ.pdf) as a primary source for that manufacturer's workflow; don't generalize it into universal fitment guarantees.
- The existing regional drive article can use [Rüsselsheim's official traffic information](https://www.ruesselsheim.de/mobilitaet/verkehrsinformationsplattform/verkehrsmeldungen). Current source checks, legal stop locations and a dated founder scouting note add value. Roadbook/AI drafts are not evidence that a road or venue is open.

Before drafting any new idea below, inspect the current leading three results, write one sentence explaining the new evidence/example the CapCar piece contributes, and reject or merge the idea if that addition is weak. Ideas 6–9 and 11–12 are product-led hypotheses with less external query validation; test with owners before investing. No customer interview transcript or support dataset was supplied.

## Five focused pillars

Integration note: remote PR #75 was preserved during this work. Its existing `/car-maintenance-tracker` and `/project-car-planner` pages now provide useful pillar destinations. Link the history/documentation ideas to the former and project/budget ideas to the latter. Improve these existing pages when needed; do not create duplicate maintenance or project-planning landing pages. The signed-out `/ai` preview is now discoverable, while generating an owner's itinerary still requires an account/provider connection.

| Pillar               | Owner need and useful cluster                                                     | Product connection                               |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| Maintenance records  | Know what happened, preserve receipts, correct mistakes and keep a usable history | Maintenance → timeline → optional passport       |
| Project planning     | Choose one job, define completion, fit it into available time/workspace           | Vehicle → build plan → tasks                     |
| Modification budgets | Distinguish a wish list from committed and actual spend                           | Planned/actual costs, parts and returns          |
| Parts research       | Record exact references, compare delivered offers, keep uncertainty visible       | Public retailer search → saved build decision    |
| Driving discovery    | Find a feasible outing and verify access/stops                                    | Roadbook → guide → optional account/AI itinerary |

Use the existing `/{locale}/journal` as the editorial hub. Link records ↔ receipts ↔ documentation; first job ↔ weekend planning ↔ workspace; budget ↔ delivered-cost comparison ↔ fitment research. Each cluster links to `/platform` and its natural product action. Studio/Sound are supporting experiences, not separate high-volume AI-content pillars.

## Twelve prioritized ideas

URLs below are English unless explicitly German. Locale equivalents already exist for current articles. Proposed new slugs are proposals, not live pages. For a new article, update article data, slug registry and all reviewed language variants coherently; do not advertise empty/English-fallback translated pages. Improvements should be reviewed in all five languages before shipping.

### 1. A car maintenance record you can understand a year later

- **Audience/problem:** daily-driver owners with dates, invoices and parts scattered across devices.
- **Intent/title:** informational implementation; “How to keep useful car maintenance records”.
- **Page:** improve `/en/journal/guide-to-vehicle-history`; preserve its existing URL and links.
- **Outline/evidence:** minimum job/date/mileage/cost fields; planned versus completed; one redacted founder job; attach source evidence; correct an entry; sharing/export boundaries. Capture actual product screenshots and confirm available export behavior before mentioning a format.
- **Internal links:** `/platform`, `/en/journal/bmw-diy-wartung-dokumentieren`, first-build article.
- **Next action:** `/garage/new?goal=maintain`, then save one actual job with an account.
- **Reusable angle:** 30-second “Can you tell what this receipt was for?” before/after record; redact identifiers.
- **Effort/priority:** 3–4 hours, **P1**. Existing page, direct activation path, differentiated evidence without mechanical instruction.

### 2. Turn a modification idea into one finishable job

- **Audience/problem:** first project owners overwhelmed by a growing modification list.
- **Intent/title:** planning/how-to; “Plan your first car project: one job, one budget”.
- **Page:** improve `/en/journal/build-plan-first-job`.
- **Outline/evidence:** state the problem; choose one outcome; list prerequisites/parts; set spending and time limits; define completion; show one saved build and a deferred item. Use an actual founder planning example; label any illustrative costs.
- **Internal links:** weekend-project article, `/platform`, `/studio`, idea 3 once live.
- **Next action:** `/garage/new?goal=modify`, save one build item after authentication.
- **Reusable angle:** show a 20-item wish list reduced to the first actionable job, without claiming the other ideas are bad.
- **Effort/priority:** 3–4 hours, **P1**. Closest editorial route to an existing activation flow.

### 3. A project-car budget that separates plans from spending

- **Audience/problem:** owners unable to tell what a build will cost versus what they have actually spent.
- **Intent/title:** template/problem solving; “Project-car budget: planned costs, purchases and actual spend”.
- **Page:** proposed `/en/journal/project-car-budget`; justified by a reusable, reconciled worked example, distinct from first-job planning. Start with a plain downloadable table only if it can be authored and checked accurately.
- **Outline/evidence:** categories; delivered part cost; labor/tools/consumables; separate reserve assumption; planned/purchased/installed states; returned item correction. Use real redacted receipts or clearly labeled illustrative arithmetic, never average repair-price claims.
- **Internal links:** first-build article, `/platform`, `/connected-parts`, idea 8 once live.
- **Next action:** create a modify-goal garage and enter one planned item; account needed to save.
- **Reusable angle:** three screenshots showing how the same item appears before ordering, after payment and after a return.
- **Effort/priority:** 5–6 hours, **P1 backlog**. Strong product fit; publish only after the two existing-page improvements and an owner example are ready.

### 4. What to record before buying a car part online

- **Audience/problem:** owners collecting plausible listings without enough exact-vehicle evidence.
- **Intent/title:** informational checklist; “Car-part research checklist: reference, fitment and seller evidence”.
- **Page:** proposed `/en/journal/car-part-research-checklist`; a distinct checklist rather than thin model/part pages.
- **Outline/evidence:** exact vehicle/variant; part position and revision; source/date; seller confirmation; delivery/returns; unresolved questions. Include a real unsuccessful match as well as a confirmed example. Consult manufacturer catalog/parts desk and preserve uncertainty; do not turn a VIN decode into a fitment guarantee.
- **Internal links:** `/connected-parts`, `/parts-search` (clearly example catalog), first-build article, budget guide when live.
- **Next action:** public `/connected-parts` search using a part number, then save a researched item in an account.
- **Reusable angle:** “Two listings with the same model name: what information is missing?”
- **Effort/priority:** 5–6 hours, **P2**. Qualified problem, but needs supplier/manufacturer evidence and editorial review.

### 5. Plan a weekend job when the car must run on Monday

- **Audience/problem:** owners who rely on the same car for work.
- **Intent/title:** planning checklist; “Plan a BMW weekend project without losing Monday's transport”.
- **Page:** improve `/en/journal/bmw-wochenendprojekt-planen`.
- **Outline/evidence:** choose a bounded job; check parts/tools/procedure; workspace; stopping point and recovery transport; record completion. Add a dated, actual founder planning timeline; do not supply unsupported torque values or universal completion times.
- **Internal links:** first-build article, no-garage article, `/platform`, parts research once live.
- **Next action:** use the existing checklist and `/garage/new?goal=maintain`.
- **Reusable angle:** show a Friday “ready/not ready” checklist; invite feedback where community rules permit.
- **Effort/priority:** 2–3 hours, **P1**. Existing piece and checklist, useful owner constraint, manageable founder workload.

### 6. Organize car receipts without publishing private details

- **Audience/problem:** owners keeping evidence for themselves, a workshop or a future buyer.
- **Intent/title:** organization/how-to; “Organize car receipts into a readable vehicle history”.
- **Page:** proposed `/en/journal/organize-car-receipts`; justify only if actual redaction/record examples add more than idea 1; otherwise make it a section of that guide.
- **Outline/evidence:** associate receipt with job/date; distinguish estimate/invoice; photograph legibly; remove addresses/plates/payment details from public examples; explain optional sharing and its actual controls. Use founder-owned receipts, permission and current product screenshots.
- **Internal links:** history guide, privacy policy, DIY documentation article.
- **Next action:** add one private history record, review sharing settings before any optional sharing.
- **Reusable angle:** a redacted invoice transformed into a short, useful job record.
- **Effort/priority:** 3–4 hours, **P2**. Useful supporting problem; merge if differentiation is insufficient.

### 7. Document a DIY job so someone else can follow its history

- **Audience/problem:** owners whose photos and notes no longer explain the work performed.
- **Intent/title:** documentation/how-to; “Document DIY car maintenance: photos, parts and completion notes”.
- **Page:** improve `/en/journal/bmw-diy-wartung-dokumentieren`.
- **Outline/evidence:** before state; task and source procedure; part/reference; completion date/mileage; unresolved follow-up; correction rather than silent deletion. Use a real founder job; clearly distinguish owner-recorded from professionally verified work.
- **Internal links:** history guide, weekend planning, `/platform`.
- **Next action:** save one completed task with a note/photo in the owner's garage.
- **Reusable angle:** three captioned pictures that make a record understandable months later.
- **Effort/priority:** 2–3 hours, **P2**. Low writing cost, but schedule after idea 1 to avoid repeating the same lesson.

### 8. Compare delivered part costs before adding them to a budget

- **Audience/problem:** owners choosing the lowest headline price while shipping or missing quantities change the total.
- **Intent/title:** calculation walkthrough; “Compare car-part offers by delivered cost”.
- **Page:** proposed `/en/journal/compare-delivered-parts-cost`; a worked decision, not a competitor comparison page.
- **Outline/evidence:** same exact reference/quantity; item price; known shipping; currency; returns; unknown taxes/fees; time-stamped source; update after checkout. Use two actual public offers with timestamps, or clearly illustrative numbers; never label an unknown total final or a stale offer available now.
- **Internal links:** `/connected-parts`, budget article, parts research checklist when live.
- **Next action:** search connected retailers and record a chosen offer as planned spend; checkout remains with retailer.
- **Reusable angle:** the apparently cheaper listing with missing shipping; show the question to resolve before choosing.
- **Effort/priority:** 4–5 hours, **P2**. Good budget activation but provider/source verification adds effort.

### 9. Plan car maintenance when you have no garage

- **Audience/problem:** apartment/driveway owners with limited space, weather protection or storage.
- **Intent/title:** practical planning; “Plan car maintenance without a garage: workspace and backup options”.
- **Page:** improve `/en/journal/bmw-wartung-ohne-garage`.
- **Outline/evidence:** permitted workspace; tool/part storage; weather/time limits; public-area restrictions; jobs to take to a workshop; transport fallback. Use first-hand photos and current local rules for any named location. Do not encourage work under unsupported cars or supply generic mechanical procedures.
- **Internal links:** weekend planning, first-job guide, `/platform`.
- **Next action:** save a maintenance task with workspace/prerequisite notes.
- **Reusable angle:** a workspace packing checklist; discuss what owners forget before opening the toolbox.
- **Effort/priority:** 2–3 hours, **P2**. Strong constraint-based angle, but local legal statements need checking.

### 10. A checked day-trip plan from Rüsselsheim to the Rheingau

- **Audience/problem:** local owners wanting a feasible day out rather than a generic route list.
- **Intent/title:** regional itinerary; “Rüsselsheim to the Rheingau: plan a relaxed driving day”.
- **Page:** update `/en/journal/ruesselsheim-rheingau-tagesausflug` and its existing locale variants.
- **Outline/evidence:** dated scouting note; lawful stops/parking; opening/access source links; current roadworks; alternative if a stop is closed; review in a navigation service. Founder checks plus municipal/venue sources are required. Do not imply continuously live road conditions.
- **Internal links:** `/roadbook`, `/ai`, `/platform`.
- **Next action:** explore Roadbook without an account; optional own AI draft after account/provider setup with charges disclosed.
- **Reusable angle:** a short stop-planning clip showing the access/source check before driving.
- **Effort/priority:** 4–6 hours excluding travel, **P2**. Existing specific page and useful first-hand angle; transport costs must remain zero or use an already planned trip.

### 11. How to make an honest engine-sound comparison

- **Audience/problem:** enthusiasts mistaking different recording conditions for a guaranteed modification outcome.
- **Intent/title:** task/tutorial; “Compare engine and exhaust recordings in Sound Studio”.
- **Page:** improve the existing `/sound-studio` introduction/help rather than add a thin article.
- **Outline/evidence:** choose A/B; add a local file; use a common start point; explain microphone/setup differences, source credits and sharing privacy. Record the actual app flow; verify licensing and each claim against `sound-desk-copy.ts`.
- **Internal links:** `/movie-cars`, `/studio`, `/platform`.
- **Next action:** select two library recordings or add one's own local recording; no account needed.
- **Reusable angle:** an A/B interaction screen capture with captions; use only licensed recordings within their terms.
- **Effort/priority:** 2–3 hours plus language review, **P3**. Helpful supporting discovery, weaker direct garage activation; finish translation gaps first.

### 12. From a visual reference to a practical build question

- **Audience/problem:** owners attracted to a car's visual direction without a defined project decision.
- **Intent/title:** product/task; “Use a 3D car reference to plan your next build question”.
- **Page:** improve `/studio` help and its existing links; no separate model-specific SEO pages.
- **Outline/evidence:** choose a reference; rotate it; supported color preview; save locally; record one question for the real car. Explain independent reference versus exact owner car and visual preview versus physical fitment. Capture supported controls and retain creator credits.
- **Internal links:** `/movie-cars`, first-build article, `/platform`.
- **Next action:** explore a reference publicly, then `/garage/new?goal=modify` for a real saved plan.
- **Reusable angle:** one camera rotation leading to one concrete planning question, avoiding a claim that the preview is a measured custom build.
- **Effort/priority:** 2–3 hours plus language review, **P3**. Reuses an engaging asset but comes after record/planning needs.

## 30-day execution plan

Day 1 starts when the founder begins this plan. Budget approximately **6–8 hours per week**; these are capacity assumptions. Spend no money on ads, listings, review incentives, new software or optional AI generation. If fewer than six hours are available, drop the new budget article and improve only the existing pieces.

| Days  | Work and time allocation                                                                                                                                              | Reviewable output                                                   |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1–3   | 1h establish Search Console/sitemap baseline; 1h owner-workflow walkthrough; 1h collect redacted founder evidence                                                     | Baseline note, one verified useful-action path, evidence folder     |
| 4–7   | 3h improve idea 1; 1h record one captioned short and one community version; 30m respond/read                                                                          | One updated history guide and two reuse drafts                      |
| 8–14  | 3h improve idea 2; 1h owner feedback through existing opt-in relationships; 1h two short reuse drafts; 1h approved directory preparation/submission; 30m metrics      | First-build improvement, questions log, at most two free listings   |
| 15–21 | 2h idea 5 update; 2h budget example research/outline; 1h localized review; 1h helpful community participation; 30m metrics                                            | Weekend checklist improvement; budget draft only if evidence exists |
| 22–27 | 3h finish idea 3 only if differentiated; otherwise use time for translation gaps; 1h reuse clips; 1h approved directory follow-up; 1h review real onboarding friction | At most one new article, or better existing multilingual pages      |
| 28–30 | 1h compare complete periods; 1h review owners' first actions; 1h select next two backlog ideas and update stale facts                                                 | Short evidence-based next-month decision                            |

Limit the month to **three existing-page improvements and at most one new article**. The remaining ideas are an ordered backlog. For every published improvement, prepare one 20–40 second captioned screen recording and one useful community post drawn from its evidence. Read each community's current promotion rules before posting. Founder affiliation should be explicit; answer questions in the thread and do not mass-post identical pitches or message strangers.

Suggested free distribution: the existing journal, a founder's existing YouTube Shorts/Instagram account if available, and one owner community already joined (such as a project-car or relevant marque forum). Start by contributing a self-contained checklist; link to the guide only where appropriate. No accounts, posts, messages or uploads were performed by this task. Do not make synthetic testimonials or ask for votes.

## Measurement and stop rules

`src/features/analytics/client.ts` already defines consent-aware events including `journal_action_clicked`, `vehicle_added`, `onboarding_started`, `onboarding_activated`, `first_useful_action_completed`, `build_item_added`, `build_task_completed` and `trip_plan_created`. Preserve consent and identifier filtering. Event definitions alone do not prove every funnel event fires in production.

Record weekly: landing page/locale/source, useful-action completions, onboarding starts and abandonment feedback; use Search Console clicks/impressions/queries as diagnostic context. Calculate useful-action completion rate only for a matching observed, consented cohort and complete period, reporting numerator, denominator and missing-consent limitation. Do not divide all traffic by a partial set of completions or call consented users representative of everyone. Directory referral attribution may be incomplete; record an optional owner-reported source without private identifiers.

Success is evidence that relevant owners complete a real task and return to update it. Set the first quantitative target only after a baseline exists. If a channel attracts curiosity but no useful actions after two complete weekly review periods, check intent and onboarding before creating more content. If an idea has no first-hand evidence, merge/defer it. If the sample is too small, report counts and owner observations rather than declaring a winning conversion rate.
