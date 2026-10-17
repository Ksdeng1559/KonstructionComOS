# Claude Code handoff: GTM opportunities from construction lead sources

Date: 2026-10-15
Status: implementation instructions; no runtime capabilities are implemented by this document.
Target: KonstructionComOS / Mortgage Mix workstream in this repository.
First market: BC; start with Metro Vancouver and Fraser Valley where source coverage is demonstrated.

## 1. Assignment and outcome

Build a workflow that converts permitted construction lead-source records into evidence-backed opportunity hypotheses, then qualified conversations and attributable outcomes.

For every relevant project answer:
1. What changed, and what evidence supports it?
2. Which customer segment can benefit?
3. Which organization/person could make the buying decision?
4. Why might this be a useful time to speak?
5. What is known, inferred, missing or contradicted?
6. What should the user verify or do next?
7. What happened after the action?

A source record is not a sales opportunity. A permit is not financing demand. A project budget is not a loan request. An unnamed builder is not proof the role is open. One project can support several distinct service hypotheses, but repeated records must not create repeated opportunities.

Primary slice: commercial finance origination for Eng & Associates. Define contractor and commercial real estate playbooks now; enable their production workflows only in the correct application and after validation.

## 2. Read and reconcile before implementation

Read AGENTS.md, CLAUDE.md, README.md, docs/PRD.md, docs/ARCHITECTURE.md and docs/FRONTEND_INTEGRATION.md. Then read:
- docs/superpowers/specs/2026-10-14-mortgage-mix-commercial-financing-design.md — current approved direction for this repository.
- docs/superpowers/plans/2026-10-15-atomic-crm-construction-intelligence-retrofit.md — separate-repository boundary and BuildData/DSCOS gates.
- docs/product-market-fit/KonstructionComOS_TAM_SAM_Product_Market_Fit.md on feature/mock-dashboard, or the supplied PMF document if absent from this branch. Do not assume that file exists on main.

The supplied PMF recommends three pilots: capital origination, contractor opportunities and commercial real estate relationships. These are hypotheses to test, not proven demand or customer results.

Inspect git status, branch, actual code, package scripts and current migrations. Never overwrite another coding agent's uncommitted work. Work on a dedicated feature branch. Where older CLAUDE/architecture notes describe organization_id as tenancy, reconcile them with the approved Mortgage Mix spec: workspaces is the tenant boundary; organizations represents business entities. Inspect the current database contract before writing migrations. Historical claims about empty tables are not current evidence that migrations are safe.

This repository targets Next.js + Clerk Organizations + workspace-scoped Mortgage Mix. Reuse construction_projects, mix_opportunities, organizations, contacts, notes, tasks and touchpoints where implemented. The Atomic CRM retrofit is a different repository using Supabase Auth/tenant_id; do not copy its auth, schema or DSCOS engine here. GPC contractor implementation belongs there unless the owner explicitly changes scope. No changes to either live database are authorized by this documentation task.

## 3. Two GTM layers

**Customer opportunity discovery:** help a broker, contractor or commercial real estate professional act on project evidence. This is the engineering priority below.

**KonstructionComOS acquisition:** demonstrate the workflow to prospective paying teams with three segment-specific landing/demo journeys. Keep SaaS sales leads separate from project stakeholders and customer financing opportunities. Track demo request → attended demo → paid pilot → activation → renewal, subject to actual implementation. Preserve existing Lovable routes and form processing. Public copy uses problem → evidenced consequence → specific workflow → demo CTA, with sourced statistics only. Never use assumed TAM, fictional projects or planning targets as achieved proof.

## 4. Lead-source contract

The initial input is construction project/permit intelligence, not a promise of verified buyers. Start with manual/CSV or synthetic fixtures for the source-independent engine. Connect only licensed, approved adapters after their contracts are verified.

| Source | Possible signal | Required validation |
| --- | --- | --- |
| Municipal permit/planning/open-data records | Application, hearing, approval, amendment, stage change | Actual dataset coverage, publisher, record identifier, event date and access/reuse terms |
| Contracted construction API, including BuildData if approved | Project history, participants and permit details | Real sample fields, license for display/enrichment/export, API key, limits and coverage |
| User-supplied CRM/referral records | Existing relationship, confirmed need, planned follow-up | Authorized workspace, provenance, relationship owner and contact eligibility |
| Approved public company/project material | Company identity or corroborating project context | Entity match, source date and lawful use; distinguish publisher assertion from independent verification |

BuildData is referenced as the sole import source for the separate Atomic CRM plan, not an already-connected API here. Do not invent endpoints, payload fields or working credentials. Keep its key, real-response mapping, rate limits and display/enrichment permissions gated. No new paid provider procurement is implied.

Normalize stable source_record_id, source_name, source_url, published_at/event_at, observed_at, first_seen_at, last_verified_at, source_updated_at, license/use restrictions, adapter version, raw snapshot reference and is_synthetic. Unknown dates stay null; ingestion time must not impersonate the event date. Store only permitted raw data.

Resolve project identity using source IDs and verified address/parcel links. Resolve companies and people separately; an applicant may be an agent or consultant rather than the owner. Keep ambiguous matches in review. Preserve conflicting assertions with their sources instead of overwriting them as facts. Re-imports are idempotent; amendments append history. Corrections/retractions re-evaluate linked hypotheses and warn the reviewer.

## Enrichment before qualification

Follow [GTM_ENRICHMENT.md](GTM_ENRICHMENT.md) for the staged identity, company, stakeholder, contact, relationship and commercial-investigation process. Preserve field-level evidence and conflicts, use bounded provider jobs and review results before qualification. Enrichment success is not confirmed demand or contact permission.

## 5. Configurable customer-fit profile

Use [client.brain.md](../client.brain.md) as the versioned client-profile contract: goals, evidenced strengths, weaknesses/constraints, preferred opportunities, exclusions, capacity and reviewed feedback. Active profiles are private per workspace, not shared repository files. Recommendations must state which profile version, strengths and interests support the fit and which gaps may prevent it.

Each workspace defines target geography, project types/stages, service capabilities, size ranges, exclusions, capacity, preferred roles and existing relationships. Contractors additionally need trade/package scope and procurement timing; brokers need financing products and sponsor-confirmed timing, with unknown need allowed; commercial teams need mandate/service type and owner context.

Use these settings to filter and explain fit, not to infer confidential financial facts. No validated profile means research-only results. A firm's role in a project does not establish interest in buying this SaaS.

## 6. Strategy library

Each strategy has an ID/version, segment, evidence predicates, exclusions, verification questions, buyer-role target, proposed offer, next action and success event. Start with deterministic rules; LLM summaries may explain cited results but cannot create evidence or override eligibility.

| Strategy | Trigger to investigate | Buyer/role to verify | First useful action | Stop/review condition |
| --- | --- | --- | --- | --- |
| CAP-01 Early capital planning | Verified planning/rezoning progression | Sponsor/developer finance lead | Confirm project ownership, timeline and whether capital planning support is relevant | No sponsor match; need remains unknown |
| CAP-02 Construction financing readiness | Permit/preconstruction milestone | Authorized sponsor/CFO | Offer readiness/document review; ask if financing is arranged and when any need arises | Existing committed financing; no current requirement |
| CAP-03 Bridge or refinance review | Authorized evidence of an actual acquisition, maturity or funding gap | Owner/finance decision-maker | Review timing, exit and supporting documents within the broker's mandate | Do not infer distress, maturity or a gap from an old permit |
| CON-01 GC/preconstruction | Early project with appointment status unknown or verified open | Developer's procurement/preconstruction lead | Verify appointment; seek a relevant introductory discussion | GC already appointed, exclusivity or procurement closed |
| CON-02 Trade-package pursuit | Stage and documented scope fit the workspace's trade | GC estimator/procurement lead | Confirm package, tender route, capacity and deadline | Awarded, incompatible scope or deadline passed |
| CON-03 Capital renewal/retrofit | Verified approved renewal/renovation work | Owner/property manager | Verify scope, funding and procurement window | Routine service/emergency dispatch outside target |
| CRE-01 Owner/developer relationship | Verified parcel/project change relevant to a defined service | Owner/acquisitions/asset lead | Confirm ownership and discuss a specific land, investment or advisory need | No mandate evidence; do not invent intention to sell |
| CRE-02 Leasing/marketing | Verified release/occupancy milestone and appointment question | Developer/leasing decision-maker | Verify appointment and actual assignment need | Exclusive mandate already in place |
| REF-01 Trusted introduction | Relevant service issue confirmed by the stakeholder | Appropriate advisor/partner | Obtain introduction permission and record acceptance | No permission, incompatible service or restricted sharing |
| REL-01 Account expansion/reactivation | New verified project for an existing authorized relationship | Existing relationship owner | Review prior interaction and offer a useful project update | Suppression, active owner conflict or stale identity |

Use a project to map adjacent participants and future projects, while verifying each relationship. Prefer a warm, permissioned introduction when available. Suggested outreach is a human-reviewed draft grounded in a specific fact and one useful question; it must not claim a financing shortfall or open contract without confirmation.

## 7. Evidence and opportunity model

Treat the following as logical fields, not permission to create duplicate tables. Map onto existing entities first; record any additive schema proposal and migration separately.

- Project: canonical identity, lifecycle, geography, project type, budget with currency/basis/date, source history and verification.
- Signal: project reference, strategy-relevant event type, event date, evidence references, confidence, contradiction and freshness state.
- Stakeholder relationship: company/person reference, project role, identity confidence, role source, appointment status and verifier.
- Opportunity hypothesis: server-derived workspace, project, segment/service role, strategy ID/version, target organization/contact (nullable), triggering signals, observed facts, inferred commercial relevance, missing information, disqualifiers, next action/owner/due date and status.
- Qualification: financing_need_status, requested_financing, current_lender_status, procurement/package status, appointment status, mandate status and stakeholder confirmation evidence. Keep unknown, confirmed, unavailable and not-applicable distinct.
- Review/outcome: reviewer, decision/time/reason, rule version, activity references, contact eligibility, attribution and outcome evidence.

Every asserted fact links to source evidence. Distinguish extraction confidence, identity confidence, evidence completeness and commercial fit. A high fit assessment must not hide weak evidence. Store budget, requested financing and committed financing separately. An empty field does not mean zero or false.

Deduplicate active hypotheses by workspace + canonical project + segment/service role + target organization when known + strategy family. Resolve null target identities explicitly; SQL null uniqueness must not permit duplicates. Attach new signals to the existing hypothesis. Material new procurement cycles may create a separately evidenced opportunity. Do not automatically mark a CRM-created hypothesis qualified.

## 8. Prioritization and review gates

Do not invent numeric weights, conversion probabilities, lender appetite or funding likelihood. Existing demo scores are illustrative. Capital Radar factor weights and the separate DSCOS incomplete sub-bands remain unresolved; this document does not resolve or replace them.

Ship explainable categorical queues first:
- **Research:** insufficient, stale, ambiguous or contradictory evidence; state the next verification task.
- **Review:** current project/profile match and traceable trigger; human must confirm commercial relevance and role availability.
- **Ready for approved action:** reviewer-confirmed fit, relevant stakeholder, supported timing and appropriate contact/sharing eligibility.
- **Hold / disqualified:** explicit reason, owner and optional review date.

Apply exclusions before ranking: cancelled projects, closed/awarded roles, out-of-profile scope, expired deadlines, restricted source use and synthetic data in live mode. Suppressed contacts cannot enter outbound action, but the record may remain for permitted research. Unknown contact eligibility never means eligible.

Rank within queues using visible configured criteria such as verified upcoming deadline and latest verified relevant event; define null handling and stable ID tie-breaks. Freshness thresholds are configuration requiring a documented pilot decision; seven days from the PMF is a proposed SLA, not a universal fact.

If numeric scores are later approved, version the rubric, show factor contributions, test boundaries and mark incomplete scores as pending. Never present missing factors as zero or rescale a partial result into a finished /100 score.

## 9. User experience and activation

Follow [docs/GTM_WIREFRAME.md](GTM_WIREFRAME.md) for the recommended queue, expandable detail, verification forms, Kanban, responsive behavior and SVG layout references.

Add a GTM Opportunities view and an expandable panel in project intelligence. Show: segment, factual trigger with date/link, why it may matter, proposed service, role to verify, unknowns, disqualifiers, evidence freshness, next action and reviewer state. Include filters for segment, strategy, source, territory, queue, owner and due date.

Use segment-specific qualification Kanban:
- Capital: Discovered → sponsor verified → financing discussion → qualified mandate → lender review → outcome.
- Contractor (correct target repository): Discovered → fit checked → stakeholder reached → invited to bid → submitted → won/lost.
- Commercial real estate: Discovered → owner verified → relationship established → mandate discussion → active mandate → outcome.
- Referral: Introduction proposed → permission obtained → accepted → outcome.

Keep lifecycle stage, qualification progress and review approval separate. Require evidence for protected transitions: a card move cannot fabricate a mandate, bid invitation, financing need or lender approval. Include keyboard/mobile move controls and rejection explanations. Retain existing expand/magnify interactions where present.

Actions: save hypothesis, assign verification task, record confirmed need, draft briefing, draft follow-up, approve internal promotion, hold/dismiss and record outcome. Internal promotion to mix_opportunities uses a transaction, audit event and idempotency key; link the project/company/contact using existing named FKs. Reuse existing notes/tasks/touchpoints. Failed promotion must not leave a partial opportunity.

External CRM writes, sending, referral sharing and campaign enrollment are separate explicit actions with eligibility and suppression checks. No autonomous outbound, lender submissions or investor solicitation. Public data availability is not contact authorization. Keep synthetic records labeled and excluded from live activation/export destinations.

A briefing must contain project snapshot → source-backed change → commercial hypothesis → role/relationship map → verification gaps → recommended action → source references. State "financing need unknown" or "appointment status unknown" wherever applicable.

## 10. Attribution and pilot learning

Record source discovery separately from first human activation and subsequent assisted touches. Preserve original source attribution when a second adapter finds the same project. Track net-new versus existing-account reactivation, reviewer, strategy version and outcome evidence. One signal seen by two users must not yield two claimed net-new wins.

Report reviewed projects → relevant hypotheses → stakeholder-confirmed needs → qualified meetings → mandates/bid invitations → won/lost, segmented by source, geography, strategy and customer cohort. Define denominators and event timestamps. Do not sum project budgets as revenue, requested loans or pipeline fees.

Qualified capital meeting: authorized sponsor confirms a credible project and discusses actual financing timing/need. Contractor: relevant buyer confirms a suitable pursuit. Commercial real estate: verified owner/developer discusses a genuine potential mandate. A meeting is not an approved loan or signed assignment.

Measure false positives, outdated records, unavailable appointments, duplicate rate, research time and source/verification/support cost. SaaS activation remains five verified projects saved plus one opportunity created in seven days. Pilot targets in the PMF are proposed experiments; do not claim PMF or achieved conversion from small samples.

## 11. Implementation sequence

1. **Contract:** inspect current branch and map fields/entities; document source capability gaps and workspace/profile/playbook contracts. Build synthetic fixtures for the strategy matrix with explicit disclosures.
2. **Safe engine:** implement pure normalization, deduplication, evidence gates and categorical strategy evaluation. Suggested new module area: src/lib/gtm/; exact filenames are implementation choices. No network required.
3. **Review UI:** implement one finance project → evidence → hypothesis → verification task → approved internal promotion flow. Mock mode can proceed while auth/source gates remain open, with no live activation.
4. **Persistence:** only after verified Clerk/workspace mapping, restrictive RLS and cross-workspace tests; add reviewed migrations and transactional/idempotent promotion. Enforce same-workspace references in the database, not merely parent-row RLS.
5. **Real source pilot:** after adapter fields, licensing, key and coverage are confirmed, use a bounded verified BC sample and compare reviewer decisions with proposed hypotheses. Do not silently enable BuildData or scheduled imports.
6. **Learning:** publish source/cohort quality and meeting outcomes; refine playbooks. Port only agreed contracts to the separate Atomic CRM workstream in a separately authorized change.

Finish one finance slice before adding all segment screens, integrations or a new orchestration framework. Do not replace current auth, CRM or public marketing infrastructure to implement this feature.

## 12. Acceptance scenarios for the implementing agent

- Permit with no sponsor or financing confirmation → research task; financing need remains unknown.
- Verified permit and profile match, but financing already committed → no new-financing claim; hold or consider only independently confirmed future need.
- Builder name missing → verify appointment; never label "builder gap confirmed."
- Trade package awarded or tender deadline expired → excluded from active bid pursuit.
- Same project imported twice, or discovered by another source → one canonical project and one active hypothesis per defined key, with both provenance records retained.
- Corrected/cancelled source record → linked opportunity flagged and action eligibility re-evaluated.
- Stale/contradictory/unknown event date → research; no urgency inferred from ingestion time.
- Suppressed/unknown-eligibility contact or synthetic project → no live outbound or external activation.
- Forged workspace IDs, cross-workspace FKs and another workspace's evidence URLs → denied; test list/detail/export/mutation paths.
- Concurrent/retried promotion → exactly one internal opportunity and attributable promotion event; rollback on failure.
- Financing figure absent → null/unknown; project budget is never copied into requested financing.
- Existing relationship reactivated → assisted/reactivation attribution, not a net-new acquisition.
- Missing numeric scoring rubric → categorical queue and "scoring pending"; no invented totals.
- Moving qualification cards → project construction stage unchanged; guarded transitions reject missing confirmation.

Run available typecheck, lint and build scripts plus meaningful engine/integration tests. main currently has no npm test script: inspect scripts and add an appropriate test harness in the implementation PR if needed. Do not claim tests from another branch or plan actually exist here. Report actual commands/results, remaining gates, changed files and the next complete slice.

## 13. Pasteable Claude Code task

> Read CLAUDE.md and docs/GTM_LEAD_SOURCE_PLAYBOOK.md, then reconcile the current Mortgage Mix design with the actual checkout. Implement the first source-independent commercial-finance GTM slice: normalized project evidence → workspace-fit/strategy evaluation → explainable research/review queue → verification task → human-approved, idempotent internal opportunity promotion. Begin with synthetic fixtures; keep live activation disabled until tenancy, source rights and qualification gates pass. Reuse existing entities and preserve the separate Atomic CRM boundary. Test unknown need, unavailable role, duplicate/retracted evidence, suppression, tenant isolation and retry behavior. Update documentation with implemented behavior and remaining gates; do not send messages, submit financing applications or claim live integration from mock results.

## Source basis

Repository documents above were reviewed on 2026-10-15. The supplied KonstructionComOS_TAM_SAM_Product_Market_Fit.md informs segment hypotheses, qualification definitions, pilot measures and the distinction between project signals and confirmed needs. No new market statistics or live provider capabilities are asserted here.

## Execution and learning completion

Follow [GTM_EXECUTION_LOOP.md](GTM_EXECUTION_LOOP.md) to connect the client brain, confirmed offers, pursuit decisions, relationship ownership, daily work and evidenced business outcomes. MVP order: offer → pursuit decision/owner → Today action queue → outcome feedback and reviewed learning. The Today view is on-demand and does not authorize scheduled notifications or autonomous outreach.
