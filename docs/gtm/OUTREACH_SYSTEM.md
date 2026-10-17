# GTM outreach system

Date: 2026-10-17. Status: implementation contract plus an executable, pure dry-run planner. No campaign, sending, provider integration, persistence, UI or booking is enabled by this change.

## Outcome and boundaries

Turn a relevant, source-backed prospect into a reviewed conversation, a qualified appointment and an evidenced business outcome. Start with BC commercial/development-finance brokers. Keep three motions distinct:

| Motion | Customer / target | Useful offer | Evidence of success |
| --- | --- | --- | --- |
| Platform sales | Klick2Client sells to a brokerage principal | Explore the construction-intelligence demo, then assess a bounded BC pilot | Qualified pilot application, paid activation and renewal |
| Broker origination | A broker pursues a developer, owner or finance lead | Project financing-readiness discussion | Authorized sponsor confirms a credible project and financing timing/need; later signed mandate and funding |
| Contractor growth | A construction service business pursues relevant project buyers | Scope/capacity discussion or permissioned estimate appointment | Suitable work and an authorized buyer confirmed; later bid invitation or won job |

An operator's subscription sale, a broker's financing prospect and a contractor's job appointment must never share one undifferentiated funnel. The third motion is a future contract for the separate Atomic CRM track, not permission to merge repositories or build its UI here.

## Fit with existing work

The existing strategy/review handoff remains in [PR #2](https://github.com/Ksdeng1559/KonstructionComOS/pull/2), branch `docs/gtm-lead-source-playbook`. Its client-brain, offer, enrichment, categorical strategy and learning contracts remain upstream. Those files are not on main at the time of this change. This document is self-contained and does not falsely link to absent local files.

The README's mock CAP-01/02/03 engine and `/gtm` queue scope remains a separate workstream. This change adds `src/lib/gtm/outreach.ts`, not the strategy evaluator, review UI, Mortgage Mix refactor or live source adapter. Reconcile filenames and contracts before combining branches. Production storage must reuse the approved Mortgage Mix entities/tasks/touchpoints after inspecting the actual schema. Do not introduce another CRM.

## Client profile → outreach

Use an approved, workspace-private client profile with version, territory, financing/services offered, project interests, evidenced strengths, capacity, minimum economics, exclusions, owner and desired outcomes. Do not commit client profiles, contact lists or conversations to this public repository.

1. **Discover:** licensed municipal/project sources, permitted CRM/referrals, or approved research adapters produce evidence-linked candidate accounts.
2. **Resolve and enrich:** canonical project/company identity → sponsor/decision-maker role → dated project stage → relationship path → contact source → open qualification questions. Keep field-level sources, conflicts and unknowns.
3. **Match:** client profile + approved offer + source evidence produce Research / Review / Ready / Hold with reasons. No invented numeric probabilities.
4. **Prepare:** draft a concise message based on one verified fact, one relevant question and one appropriate CTA. Do not infer financing shortfalls, distress, contract availability or buyer intent.
5. **Review:** an authorized person checks factual accuracy, recipient, sender identity, contact basis, source rights, suppression, motion, offer and final wording. Approval binds the candidate, motion, channel, exact content version and evidence version, with expiry.
6. **Act:** in this release, an internal manual-action recommendation only. Future sending requires its own server-side execution path and explicit campaign authorization. Recheck eligibility immediately before delivery.
7. **Qualify and book:** classify replies; interested responses receive qualification questions. Confirm attendee, timezone, duration and live availability before booking. A calendar link click is not a booked or held meeting.
8. **Learn:** record outcome, evidence, attribution, cost and reason. Feedback proposes profile/offer changes for review; it never silently changes the client brain.

## Source and agent adapter contracts

| Proposed component | Responsibility | Boundary / next verification |
| --- | --- | --- |
| LeadSniperAI | Bounded account discovery and source-linked briefing | Confirm callable interface, source rights, coverage and actual fields |
| DataForSEO business data | Company/location/review corroboration where licensed | Match entity, verify current API contract and permitted retention; never infer financing demand |
| Exa or other approved research | Corroborate company/project facts and business roles | Preserve publisher, URL, observation date and conflicts; no invented enrichment |
| Harvey-style agent adapter | Drafting, qualification support and proposed next actions | Proposed role only; verify repository/version, license, tools and deployment before integration |
| Existing CRM | Authoritative owner, tasks, outcomes and interaction history | Use current workspace mapping and existing named FKs |
| Sending/calendar adapter | Future approved delivery or booking | Server-only credentials, least privilege, signed events, deduplication and explicit execution gate |

High review ratings with low review counts can be a contractor marketing research signal. They do not prove spare capacity, desire for jobs, creditworthiness, expansion plans or financing needs. Confirm the relevant need directly. No provider connection or paid procurement is included here.

## Logical records, not a migration

- **Campaign:** workspace, motion, approved offer/profile versions, territory, owner, channel, draft/active/paused state, approved budget, limits, local sending window and versioned sequence.
- **Enrollment:** canonical account/contact/project references, source/strategy attribution, owner, motion, state, next action, stop reason, enrollment version.
- **Evidence:** source ID/URL/date, assertion, entity match, allowed use, verification version/date, conflict/freshness, synthetic flag.
- **Contact basis:** channel-specific status/evidence, reviewer/time, validity/review deadline; unknown is blocking. This is an internal review contract, not a legal determination.
- **Draft and approval:** immutable content/version or content hash, verified sender identity, evidence references, reviewer, approved scope and expiry. Changes invalidate approval.
- **Action/outbox:** durable idempotency key, enrollment step, pending/claimed/accepted/delivered/failed/unknown state, provider IDs, attempt history and next permitted action.
- **Reply/meeting/outcome:** deduplicated event ID, occurrence and receipt times, source, actor, linked opportunity and supporting evidence.

Persist same-workspace foreign-key checks and uniqueness, not just parent-row RLS. Derive workspace authorization from verified identity; never trust browser organization IDs. Keep provider secrets and private PII out of browser bundles, logs and git.

## Sequences and stop rules

Suggested pilot cadence, **not a scheduled automation**: first contact on day 0, useful follow-up no earlier than day 4, final permission-to-close-loop follow-up no earlier than day 10. Defaults require campaign-owner approval and channel-specific review. Do not automatically repeat on another channel.

Before each proposed touch check current evidence, contact basis, account owner, active conversations, maximum touches and recent contact across campaigns. A reply, meeting, unsubscribe, complaint, hard bounce, explicit no, source restriction, suppression or ownership conflict stops pending automated touches. Out-of-office pauses for review; no automatic re-enrollment. Nurture requires a documented date/trigger and renewed eligibility review.

Draft anatomy:
- Identify the actual sender and organization.
- Cite a verified project/company context without implying a prior relationship.
- Ask a single question appropriate to the motion; for financing, ask whether financing is already arranged and if a review would be useful.
- Offer a clear next step without guaranteed approvals, rates, jobs, exclusivity or returns.
- Include reviewed identity/contact and opt-out elements appropriate to the channel before any live delivery.

No autonomous investor solicitation, lender application submission or credit decision. Publicly visible contact data alone is not approval to contact. Legal/content review and current applicable requirements must be verified before enabling live outreach; this specification makes no determination that a particular contact is legally eligible.

## Future delivery reliability

Use transactional outbox insertion and a unique constraint on workspace + enrollment version + channel + step. The planner's tuple key supports identity only; it does not implement durability or exactly-once delivery.

The worker claims an action transactionally, rechecks suppression/approval/evidence, and uses provider idempotency where available. On timeout after an uncertain provider acceptance, mark unknown and reconcile provider status before retrying. Do not blindly resend. Signed webhook events deduplicate by provider event ID and cannot overwrite suppression with older delivery events. Approval of one message is not approval of an entire campaign.

## Qualification and booking

Broker questions: authorized sponsor/borrowing entity; actual project; financing already arranged or needed; approximate amount if volunteered; timing; desired next step. Requested financing remains unknown until confirmed; never copy project budget into it. Collect sensitive borrower documents through the existing secure intake, not prospecting messages.

Contractor questions: actual job/scope, location, buyer authority, timing, procurement route and contractor capacity. Contractor records stay in their authorized workflow.

Appointment lifecycle: proposed → booked → attended / cancelled / no-show → qualified / not qualified. Check calendar availability immediately before a booking write; use idempotent booking identifiers and explicit prospect agreement. Reschedules/cancellations invalidate reminders. Automated booking remains unimplemented.

## Wireframe for the future Outreach workspace

1. **Header:** motion selector, approved offer/profile version, owner, date range, synthetic/live disclosure. No enabled Send button in mock mode.
2. **Evidence scorecard:** reviewed accounts, draft approvals, positive replies, held qualified meetings, mandates/jobs and attributable results. Show denominators, period and unknowns.
3. **Tabs:** Research / Drafts / Approval queue / Active / Replies / Meetings / Outcomes / Suppression.
4. **Expandable prospect card:** trigger and source/date, company and role, fit reasons, unknowns, contact-basis status, owner/conflicts, next task and versioned draft.
5. **Detail panel:** evidence on left; message and qualification questions on right; approval diff/history below. Decisions require reasons where rejected or overridden.
6. **Today view:** due commitments, replies needing attention, qualification tasks, meeting preparation and unresolved delivery; stable due-time ordering and visible timezone.
7. **Mobile:** stacked evidence/draft sections and accessible buttons for state changes; no drag-only actions. Show blocked-state explanation, empty state and retry state.

## Metrics and acceptance

Track unique reviewed candidates → eligible candidates → delivered contacts → positive replies → booked → held qualified meetings → mandates/jobs → funded/won → earned fees → paid renewal. Platform-sales revenue and clients' revenue remain separate.

Positive reply rate = unique positively responding contacts / unique delivered contacts in the same cohort. Qualified meeting yield = held qualified meetings / unique reviewed candidates. Report hard bounces, opt-outs, no-shows, stale evidence, missing outcomes and research/support/provider costs. Exclude internal tests and synthetic records. Do not treat opens, scheduled appointments, loan principal or construction budgets as revenue.

Pilot targets are hypotheses: retain PMF activation at five verified projects plus one opportunity in seven days; measure preparation time against each team's baseline; report sponsor-confirmed meetings and paid renewal without claiming causal lift from small samples. Numeric outreach conversion targets remain unset until a measured baseline exists.

Acceptance: restricted/synthetic/suppressed records cannot activate; role/fit/evidence/basis gaps produce research; changed/expired approvals return to review; replies and meetings stop follow-ups; duplicate retries do not duplicate actions; qualified outcomes require evidence; cross-workspace reads/writes are denied before production access.

## Implemented now

`src/lib/gtm/outreach.ts` implements a typed, deterministic planning gate and stable action key only. Tests cover freshness, holds, approval invalidation, workspace mismatch and retry identity. It trusts typed internal inputs: validate all external payloads separately before calling. It is neither authentication nor a complete contact-compliance engine. All results have `deliveryEnabled: false`.

Run `npm run test:gtm` using Node 22.18+ or Node 24. No credentials needed. Follow [CLAUDE_IMPLEMENTATION.md](CLAUDE_IMPLEMENTATION.md) for subsequent slices.

## Source basis

Repository README, AGENTS, CLAUDE, PRD, architecture/frontend contracts, open GTM PR #2 and the supplied `KonstructionComOS_TAM_SAM_Product_Market_Fit.md` (October 14, 2026). [Broker landing-page brief](https://www.notion.so/3f99e94cf0a4817b8f58ff0c6dc2028d) provides the demo/pilot acquisition narrative. This change adds no new industry statistics or verified provider capabilities.
