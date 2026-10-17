# Client goals, outcomes and success metrics

Date: 2026-10-15
Status: proposed measurement and UI contract; no measured baseline or achieved results supplied.
Companions: [client brain](../client.brain.md), [execution loop](GTM_EXECUTION_LOOP.md), [wireframe](GTM_WIREFRAME.md).

## 1. Goal contract

Every active client sets a small set of explicit goals. A goal is not a task or a generic aspiration.

Required fields: goal ID/version, workspace, client-profile version, owner, desired business outcome, metric definition/version, baseline value and period, target and rationale, start/end dates, review cadence, linked offers/strategies, current status, evidence source and next action.

Default targets and baselines are unknown, not zero. Record actual zero only where a complete source supports zero events in the stated period. Goal states: draft, active, completed, paused or retired. Preserve changes and approvals; do not move a target retrospectively to create apparent success.

Example structure, not a client commitment:
"By [date], obtain [client-approved number] of sponsor-confirmed financing meetings for [offer/territory], from a measured baseline of [value/period], within [capacity/cost limits]."

Keep three levels:
- Business goal: what useful outcome the client wants.
- Outcome metric: how progress will be evidenced.
- Action/task: what someone will do next to influence it.

## 2. Recommended MVP scorecard

Start with up to three primary outcomes for the active workflow; show drivers only where they explain an action. Finance is the first implementation here.

| Primary outcome | Definition / calculation | Why useful and main limit |
| --- | --- | --- |
| Qualified meetings held | Count distinct meeting IDs held in the period where an authorized relevant stakeholder confirms a credible project and discusses actual financing timing/need; require qualification evidence | Early evidence of useful origination; meetings alone do not prove a mandate |
| New mandates signed | Count distinct evidenced signed mandate IDs, with signed date in the period and relevant scope | Indicates commercial commitment; typically slower than meeting activity |
| Realized fee revenue | Sum actual recognized fee-revenue events in the period under the client's documented accounting basis, net of reversals; retain currency | Measures business value; depends on accounting integration and long closing cycles |

If accounting evidence is unavailable, mark fee revenue "Not measured" and omit it from the active KPI set until supported. Cash collected, recognized revenue, expected fees and loan principal are different measures; do not mix them.

Contractor variant: suitable buyer-confirmed meetings → genuine bid invitations → contracts won, with evidenced contract revenue reported separately. Commercial real estate variant: owner-confirmed mandate discussions → signed mandates → realized fees. These are contracts for the correct future workflow, not permission to implement the separate Atomic CRM app here.

## 3. Supporting drivers and guardrails

Use a small supporting set; avoid a wall of vanity counters.

| Measure | Exact meaning | Decision it informs |
| --- | --- | --- |
| Confirmed suitable pursuits | Distinct opportunities accepted for pursuit with confirmed fit evidence during the period | Whether discovery/enrichment produces relevant work |
| Due actions completed on time | Tasks with due_at in the period and completed_at <= due_at / all non-cancelled tasks due in that period; preserve due-date edit history | Whether follow-up capacity matches the plan |
| Matured pursuit-to-meeting conversion | Pursuits accepted in a stated cohort that reach a qualified meeting within the configured observation window / all pursuits in that cohort with that full window elapsed | Whether relevance and follow-up produce conversations; show pending cohorts separately |
| Cost per qualified meeting | Attributable permitted sourcing/enrichment/verification cost for the stated cohort and window / qualified meetings from that same cohort/window | Whether a channel is economically useful; zero meetings means undefined, not zero cost |
| Reviewed evidence error rate | Incorrect critical assertions / independently reviewed critical assertions in the stated sample | Whether source quality needs correction; report sample size and selection method |

Select one or two relevant drivers per outcome, not all by default. Pick at most two headline guardrails: evidence error rate and cost per qualified meeting are recommended pilot candidates. Track security, suppression and unauthorized-action incidents operationally even when they are not headline cards.

Enrichment volume, contact count, emails drafted and project budgets are operational diagnostics, not evidence of client success.

## 4. Targets, progress and cadence

Do not invent benchmarks or hardcode targets from the PMF as client commitments. PMF pilot targets remain proposed product experiments and belong to a separate product-validation view.

Establish the actual recent baseline over a representative client-approved period. Record source completeness, seasonality, available pursuit/review capacity and typical sales cycle. Agree targets using those inputs. If baseline is missing, set a measurement goal first and show "Baseline needed."

Weekly review: useful conversations, due actions, blocked pursuits and evidence quality.
Monthly/quarterly review: mandates, realized economics, source/offer mix and whether to adjust the strategy.
The date range and actual timezone are explicit; use the client's configured timezone, defaulting to the workspace setting. Never interpret a due date using a hidden server timezone.

For a higher-is-better count goal with positive target, progress = actual / target; a progress bar may cap visually at 100% while the label shows actual and overachievement. Zero/unknown targets have no percentage. Reduction goals use a declared baseline-to-target calculation and direction. Do not apply the same formula to all metrics.

Show on-track/at-risk only after a documented pacing rule and sufficient evidence exist. Early MVP can show actual, target, gap and time remaining without forecasting. No invented probability of success.

## 5. Instrumentation and source of truth

Reuse source-backed events for qualified meetings, signed mandates, contracts and fee records. Store stable event ID, workspace, entity references, event type/date, recorder, evidence, attribution, metric version and reversal/correction links. Use idempotent writes and unique event keys.

Separate event date from recorded date. Corrections recalculate affected periods and preserve audit history. Filters must not join one event to multiple signals and multiply its count.

Report net-new, reactivated and assisted outcomes separately; do not sum overlapping attribution categories as unique wins. Multiple source touches can assist one event without becoming multiple events. Distinguish activity within a date range from conversion for a pursuit cohort.

No double counting with the SaaS acquisition funnel: paying-client activation/renewal measures product success, while the client's mandates/fees measure its own business success.

## 6. Goals & Success wireframe

Add a Goals & Success tab to Client Profile and a linked client scorecard route, reusing the existing Results area if appropriate.

Top: client, active goal period, owner, profile version and last data update.
Goal cards: outcome statement, actual, target, baseline, gap, time remaining and evidence link. Missing baseline/target/source is explicit.
Middle: short funnel of defined business outcomes, with event counts and separately labeled matured cohort conversion.
Bottom: blockers, recommended next actions, source/offer contribution and review notes.
Actions: Add/edit goal, Record evidenced outcome, Review progress and Propose strategy change.

Clicking a number opens its underlying authorized records and definition. Client-confirmed targets show approval/history. Today tasks can link to a goal but completing them never increments meetings or mandates. Keep private financial data out of shareable briefs by default.

## 7. Acceptance checks and first slice

First slice: one active client goal for qualified meetings, unknown baseline/target until entered, evidenced meeting recording, filtered actual count and drill-through. Then add mandate outcomes, cohort drivers and economics only when their data exists.

Test: unknown versus true zero; no-target progress; duplicate event retries; event/recorded-date differences; corrections/reversals; timezone boundaries; mixed currencies; cohort observation windows; missing accounting evidence; join duplication; cross-workspace detail/export denial; task completion not counting as a business outcome.

Implement UI/data logic and run appropriate tests in the implementation PR. This document is a recommended framework, not a report of achieved results.
