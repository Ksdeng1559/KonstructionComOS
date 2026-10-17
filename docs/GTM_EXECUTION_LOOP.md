# GTM execution and learning loop

Date: 2026-10-15
Status: proposed Claude Code implementation handoff; no runtime features enabled.
Companions: [client brain](../client.brain.md), [GTM playbook](GTM_LEAD_SOURCE_PLAYBOOK.md), [enrichment](GTM_ENRICHMENT.md), [wireframe](GTM_WIREFRAME.md).

## Objective

Connect client understanding to actual business outcomes:
client profile → relevant signal → enrichment → offer fit → pursuit decision → assigned action → evidenced outcome → reviewed learning.

Implement five connected capabilities. Reuse the existing Mortgage Mix entities and tenant-scoped tasks, notes and touchpoints; do not create another CRM or merge the separate Atomic CRM workstream.

## 1. Offer playbook

A strategy describes when to investigate; an offer describes the useful service the client can actually deliver. Store versioned, workspace-private offers linked to the active client brain.

Required fields:
- Offer ID/version, name, active/draft status, owner and review date.
- Intended customer/decision-maker, geography and permitted service.
- Problem addressed, concrete deliverable, useful outcome and scope limits.
- Qualification questions, required capabilities and disqualifiers.
- Supporting proof/case references, with permission to use and dated evidence.
- Commercial terms or pricing basis where actually approved; otherwise unknown.
- Appropriate next step/CTA: readiness review, scope discussion or permissioned introduction.
- Approved factual language, claims requiring review and associated strategy IDs.

Start with one client-confirmed offer. Proposed financing example: a project financing-readiness review that establishes sponsor, timeline, financing status and required documents. It does not promise approval, a rate or lender appetite. Contractor and commercial real estate offers stay proposed until the corresponding client and application scope support them.

An offer must not become active merely because a model wrote it. Unsupported proof remains pending. Changes to scope or required capabilities trigger review of dependent open recommendations.

## 2. Pursuit decision

Recommend one disposition per opportunity and offer:
- **Pursue:** enough supported fit and a useful next action within the client's capabilities.
- **Partner:** relevant need may fit, but a documented capability/relationship gap needs an appropriate partner.
- **Nurture:** plausible future fit with a specific evidence-backed timing trigger or agreed review date.
- **Pass:** explicit exclusion, unavailable role, incompatible economics/capacity or confirmed no need.

Use **Needs research** as the unresolved state when evidence/profile is insufficient; never force one of the four decisions from unknown facts.

Store recommendation separately from the user's decision. Include client profile version, offer version, strategy version, evidence references, matched strengths/interests, gaps, exclusions, timing basis, next action and review date. Show reasoning without an invented numeric score. A human decision records actor/time/reason and any override explanation.

Pursue is an internal allocation of effort, not proof of buyer intent, a mandate or permission to contact. Partner requires capability fit plus permission before sharing details. Nurture does not automatically enroll someone in a campaign. Pass retains reason/history and respects retention rules.

Re-evaluate after a material source correction, profile/offer change, capacity change, expired timing or new stakeholder confirmation. Keep earlier decisions for audit and mark outdated recommendations.

## 3. Relationship ownership

For each account/project/opportunity show:
- Account owner, pursuit owner and next-action assignee as distinct roles where needed.
- Existing account/contact links and current relationship history.
- Potential introducer, relationship evidence/recency and introduction permission status.
- Existing active pursuit and any ownership conflict requiring resolution.
- Last meaningful interaction and next agreed action, when recorded.

Reuse existing owner/membership fields before proposing new ones. Assignment must resolve to an authorized workspace member. Use transactional ownership updates and duplicate checks so concurrent users cannot unknowingly create competing active pursuits for the same defined scope.

Conflicts produce a visible resolution task, not silent reassignment. Proposed introductions cannot expose private relationship notes or another workspace's contacts. No cross-client prospect exclusivity is implied by ownership inside one workspace.

## 4. Daily action queue

Build an on-demand **Today** view; this document does not schedule an automation or send a daily message. Display overdue and due actions in the user's timezone with a visible date.

Each row/card contains action type, project/company, reason now, evidence/decision link, owner, due date, current blocker and one contextual CTA.

Action types: verify fact, resolve identity, review enrichment, confirm need, request introduction permission, prepare briefing, record follow-up, resolve ownership or review nurture trigger.

Prioritize deterministically:
1. Supported deadline-sensitive and overdue actions.
2. Due commitments already agreed with a stakeholder.
3. Required verification blocking a relevant pursuit.
4. Other assigned actions.

Within a group sort by due time then stable ID; undated tasks remain in an explicit backlog, not falsely overdue. Allow priority overrides with rationale. A suggested default focus list of five actions is a configurable UX choice, not a performance claim.

Reuse tasks and their references; the Today queue is a view over work, not another task store. Completing a task does not automatically confirm a fact, qualify a mandate or send a message. Completion can prompt the user to record evidence. Snooze/defer requires a new date or trigger and preserves the history.

Respect suppression/action eligibility at execution time. Blocked outreach may be replaced by a permitted internal research task. Drafting, approval, CRM promotion and sending are separate events.

## 5. Feedback, outcomes and reviewed learning

Record lightweight client feedback: accepted/rejected/deferred recommendation, reason, optional correction and related evidence.

Use consistent reason categories with optional notes:
- Wrong geography/type/size/stage.
- Capability or capacity gap.
- Timing too early/late.
- Stakeholder/role incorrect or already appointed.
- Financing/service need absent or unknown.
- Existing relationship/pursuit/conflict.
- Evidence stale, incorrect or incomplete.
- Economics unsuitable.
- Good fit; useful next step.
- Other, with explanation.

Record business outcomes separately: meeting held, confirmed need, mandate signed, invited to bid, bid submitted, won/lost/no need. Scope them to the active workflow; no loan approval or funded outcome without actual evidence. Store event date, evidence, actor and attribution type: net-new, reactivated or assisted.

Keep separate denominators for projects reviewed, recommendations made, pursuits accepted, actions completed, qualified meetings and business wins. Deduplicate repeated imports/touches and do not count a task completion as a meeting. Only actual permitted commercial data supports revenue/fee metrics; never project budget totals.

Feedback may propose a new brain/offer version, rule change or source-quality investigation. It never silently rewrites approved preferences. Show proposed change, supporting feedback, affected recommendations and an authorized reviewer. One rejection or silence is not sufficient evidence of a general preference.

Report source and cohort results with date range, sample size, missing outcomes and definitions. Avoid causal improvement claims from small observational samples.

## 6. UI additions

| Area | Addition |
| --- | --- |
| Client Profile | Offers tab with scope, proof, qualification, CTA, version and approval |
| Opportunity detail | Offer fit; recommended disposition; rationale; owner/introducer; action |
| Review action | Confirm pursue/partner/nurture/pass or retain Needs research; evidence and reason |
| Navigation | Today view, using existing tasks |
| Queue/Kanban card | Pursuit disposition, next action and ownership conflict indicator |
| Results | Source/strategy/offer outcomes with explicit denominators |
| Profile review | Proposed learning changes and approval/version history |

Keep disposition, review eligibility, project lifecycle and qualification stage as separate labeled states. To avoid badge clutter, show the most useful status in a card and all four in expanded detail. Do not replace the existing guarded capital Kanban.

## 7. MVP sequence

1. One confirmed offer mapped to the client brain and relevant strategy.
2. Explainable pursuit recommendation, human decision and relationship/pursuit owner.
3. Today view for verification and follow-up tasks.
4. Outcome/feedback capture and proposed reviewed profile changes.

Synthetic fixtures can cover the flow before production integration. Real client data requires the existing verified tenancy/RLS gates; external actions require independent authorization/eligibility. Pricing, provider calls and real sending are outside this documentation change.

## 8. Acceptance checks for Claude Code

- Same project yields different recommended actions for different confirmed client capabilities/interests.
- Missing profile or unsupported need returns Needs research, not invented qualification.
- An unavailable role/exclusion supports Pass with evidence.
- Missing capability suggests Partner without sharing client data.
- Nurture has an actual date/trigger and does not create campaign enrollment.
- Existing pursuit/owner conflict prevents duplicate silent activation.
- A deadline-sensitive task ranks predictably; undated backlog is not overdue; timezone boundaries are handled.
- Completing a task records completion only; confirmations and outcomes require their own evidence.
- Source/profile/offer changes flag stale recommendations without erasing history.
- Client feedback creates a draft proposed change; approval creates a new version.
- Retries/concurrent actions do not duplicate tasks, pursuits or outcome events.
- Cross-workspace ownership, notes, feedback, exports and mutations are denied.
- Synthetic flows cannot reach live integrations.

Run meaningful logic, interaction and authorization tests alongside available typecheck/lint/build for the implementation. These checks are requirements, not tests executed by this documentation update.

## Pasteable Claude Code task

> Read client.brain.md and the GTM playbook, enrichment, wireframe and execution-loop handoffs. Implement one complete synthetic finance workflow: client-confirmed offer → evidence-backed pursuit recommendation → human decision with account/pursuit ownership → Today task → evidenced feedback/outcome → proposed client-profile update for review. Reuse existing CRM entities/tasks and preserve separate lifecycle, eligibility, disposition and qualification states. Test ambiguity, exclusions, ownership conflicts, dates/timezones, retries, reviewed learning and tenant isolation. Do not enable paid providers or external sends from mock work.

## Goals and success

Use [GTM_GOALS_SUCCESS.md](GTM_GOALS_SUCCESS.md) to connect the execution loop to client-approved outcome goals, metric definitions, evidence, baseline/target review and a Goals & Success scorecard. Tasks and enrichment counts do not increment business outcomes.
