# commercialKonnect — Technical Implementation and Slack Operations
**Version:** 1.0 | **Date:** 2026-10-21 | **Owner:** Product/Engineering | **State:** Target specification, not proof of implementation

## 1. Executive architecture and canonical boundaries
- **Public production website:** WordPress at **https://www.commercialkonnect.ca** (hosting, domain activation and production readiness require verification). Owns SEO, 50-page content plan, business-financing education, landing pages, business directory, consent-based intake, broker demo CTAs, legal pages and WordPress editorial workflows. Preferred design system: Astra + Gutenberg/block patterns subject to build tests. IONOS VPS is a hosting candidate, not a confirmed deployment. WordPress must not be the canonical CRM database.
- **Lovable:** design/prototyping only. Never present a Lovable URL as the production frontend or assume its React/Vite application is integrated with Next.js.
- **Authenticated broker application:** existing Next.js/TypeScript scaffold; eventual app subdomain is TBD. Mission Control, project/business intelligence, LeadSniperAI discovery, verified prospects, sales intelligence cards, outreach review, qualification Kanban, account history and Chief of Staff.
- **Identity:** Clerk with Organizations for application users; server validates active organization. Public WordPress accounts are *not* assumed to be the same identity domain; broker login handoff uses an explicit auth plan and verified redirect allowlist.
- **System of record:** Supabase Postgres with tested RLS; not WordPress user meta, Slack messages or any agent memory. Keep public lead-consent records, tenant-specific private contact notes and source evidence separate.
- **Workload and hosting:** Vercel for Next.js, Supabase for transactional data, optional Railway for asynchronous ingestion/AI workers, GitHub for changes and CI/CD, Slack for coordination and alerts. Hosting vendors/regions must be checked before production onboarding.
- **Existing conflicting designs:** the GitHub README describes Mortgage Mix table reuse and a separate Atomic CRM retrofit. Decide canonical CRM records, tenancy key, data ownership, and migration strategy before implementation; do not build two independent stores of opportunities.

### Data flow
```text
Visitor -> WordPress site -> server-side intake API -> consent/lead staging -> review/routing
                                                               |
Business/permit signals -> source adapters -> raw evidence -> normalize/dedupe -> review
                                                               |
                                      Supabase canonical business/project/prospect models
                                                               |
                    Next.js Broker Mission Control -> Kanban / briefs / Chief of Staff
                                                               |
GitHub CI/CD + Vercel/Railway/WordPress operations -> observability -> Slack triage/approvals
```
Do not send credentials or borrower financial documents through Slack. Slack links to restricted dashboards/tickets instead.

## 2. Source of truth and delivery status
The repository currently documents a Next.js MVP scaffold and **synthetic dashboard fixtures**. Its existing PRD, ARCHITECTURE, FEATURES_AND_BENEFITS, OODA_CHIEF_OF_STAFF and EXA_RESEARCH_INTEGRATION are design sources; the latter agent and Chief of Staff services are **planned**. Lovable is a distinct Vite/React prototype and is not production-integrated. The README notes unresolved Supabase tenancy/migration issues. Therefore: no feature below is claimed production-ready without a verified commit, live endpoint, owner, automated tests and deployment evidence.

**State machine for feature register:** planned -> in-development -> in-review -> tested-in-staging -> deployed -> verified-in-production; also blocked/deferred/retired. Document evidence URL, owner, scope and release ID for every transition.

## 3. Feature register and implementation contracts
| ID | Capability | Priority | Acceptance / operational contract |
|---|---|---|---|
| WEB-01 | WordPress production CMS, content, Astra design system | P0 | Staging and production separated; editors restricted; 50-page taxonomy and redirects reviewed; SSL, cache, backups and SEO sitemap tested. |
| WEB-02 | WordPress directory and broker/borrower landing pages | P0 | Structured company/category/location pages; canonical URLs; privacy-safe form conversion; no unverified lender claims. |
| WEB-03 | Intake, source/UTM attribution, consent and routing | P0 | API validation, idempotency, explicit consent/purpose/timestamp/source; double-submit dedupe; PII encrypted and retained under policy; no lead silently discarded. |
| IAM-01 | Clerk teams, roles and tenant mapping | P0 | All server endpoints verify identity and active tenant; role matrix; cross-tenant read/write tests; audit admin changes. |
| DATA-01 | Canonical Postgres migration and Supabase RLS | P0 | Reviewed migration and reversible changes, preflight backup, tenant RLS tests; reconcile existing Mortgage Mix and Atomic CRM decisions. |
| INT-01 | LeadSniperAI discovery: Google Business Profile/Places or licensed business sources | P0/P1 | Approved API access and permitted uses; source, timestamp, place identifier, coverage and quota logs; distinguish listing presence from genuine financing need. |
| INT-02 | Construction/municipal/public project signals | P0 | Source URLs, observation/publication times, addresses, stages, status freshness; licensed API and permitted public feeds only. |
| INT-03 | Evidence normalization, entity resolution and duplicate detection | P0 | Raw snapshots retained per terms; deterministic keys plus human-resolvable candidates; no cross-tenant private-data leakage. |
| INT-04 | Prospect quality and verified financing intent | P0 | Observed signals vs assumptions vs owner-confirmed needs separately; no automatic classification of listing growth or review count as financing intent. |
| INT-05 | Exa/Tavily/Parallel/other adapter comparison | P1 | Provider-independent schema, common adjudicated queries, limits, spend ledger, citeable evidence, manual fallback; feature flagged. |
| CRM-01 | Company/owner/sponsor records and stakeholder map | P0 | Source provenance per assertion; identity confidence; lawful storage and private tenant notes. |
| CRM-02 | Commercial financing opportunity Kanban | P0 | Discovered -> Verified -> Financing Conversation -> Qualified -> Lender Review -> Outcome with editable stages, timestamps, owner and next action. Financing stage independent of construction stage. |
| CRM-03 | Search, filtering, saved lists, cards and CSV import/export | P0/P1 | Scoped search; expandable cards; visible demo vs verified state; secure export, import validation and error report. |
| GTM-01 | Client Brain / prospect briefing and battlecards | P1 | Versioned goals/ICP, sourced briefing with confidence/unknowns, approval and human edit history. |
| GTM-02 | Video sales, personalized email, outreach and scheduling | P2 | Authorized templates, CASL eligibility/suppression, audit, opt-out and explicit approval gates. No autonomous mass outreach. |
| GTM-03 | Multi-solution financing offer mapping | P1 | Broker can identify relevant commercial mortgage, ABL, equipment, working capital and other product hypotheses without claiming eligibility or approval. |
| STAFF-01 | Chief of Staff OODA / Mission Control Today | P1 | Observe -> Orient -> Decide -> Act; top-three recommendations with citations, risk and alternatives; review/approve/reject queue; all tool actions audited. |
| MARKET-01 | Bond yields, lender/product, zoning and news context | P1 | Source/freshness identifiers and region; no unsourced live-market claims; reproducible alerts. |
| PAY-01 | Subscriptions, pay-per-lead and usage/billing ledger | P2 | Immutable delivery/acceptance evidence, payment provider webhook verification, refunds/disputes and export audit. |
| OPS-01 | GitHub / Slack incident and release controls | P0 | Routing, ownership, severity, runbooks, incident communications, gated production releases, rollback verification. |
| OPS-02 | Metrics, observability, budget monitoring | P0 | Error rates, latency, ingestion lag, tenant-access violations, provider/API cost, lead quality and pipeline activation observable. |

### Segment-specific pipelines
- Finance broker: discovered / sponsor verified / financing discussion / qualified mandate / lender review / outcome.
- Contractor: discovered / trade fit / stakeholder reached / bid invited / bid submitted / won-lost.
- Commercial real estate: discovered / owner verified / relationship / mandate discussion / active mandate / outcome.
Track outcome attribution and prevent a discovered public signal from being described as a confirmed deal.

## 4. Suggested entity schema (design only; migrate after reconciliation)
- `organizations`: id, clerk_org_id, name, plan, status; `memberships`: user_id, organization_id, role, status.
- `companies`: id, normalized_name, website, industry, registration identifiers, provenance, public_location.
- `business_locations`: company_id, platform_place_id, address, phone, category, rating_observed, review_count_observed, observed_at, source_ref (no implication of intent).
- `projects`: id, normalized_address, geography, stage, stage_verified_at, source_id, budget_estimate, confidence, public_status.
- `source_evidence`: id, source_type, publisher, canonical_url, first_seen_at, last_seen_at, retrieved_at, usage_rights, hash, evidence_payload_ref.
- `prospect_candidates`: id, company_id, evidence_ids, opportunity_hypothesis, unknowns, score_explanation, review_status, reviewer_id.
- `workspace_opportunities`: id, organization_id, company_id, project_id, financing_need_status, pipeline_stage, owner_id, next_action_at, origin, status.
- `interaction_events`: organization_id, opportunity_id, actor, medium, consent_basis_ref, outcome, happened_at.
- `consent_records`: identity_ref, purpose, collection_channel, wording_version, granted_at, revoked_at, legal_basis_review.
- `decision_proposals`, `approvals`, `agent_executions`, `outcome_reviews`: tenant, evidence, proposal, reviewer, authorization scope, result and immutable audit links.
- `ingestion_runs`, `import_errors`, `provider_usage`, `deployment_events`, `incident_links`: diagnostics, owners, costs, correlation IDs.
Enforce explicit organization scope for confidential entities, RLS on each tenant table and service-role access only in narrowly scoped trusted jobs.

## 5. APIs and contracts (proposed, not live endpoints)
```
POST /api/v1/public/intakes
  {source, campaign, company, contact, financing_interests[], consent:{purpose,text_version,checked_at}}
  -> 202 {intake_id, status:"queued"}  // rate-limited, anti-spam, idempotency key
GET /api/v1/workspaces/{id}/prospects?status=&cursor=
POST /api/v1/workspaces/{id}/prospects/{id}/review
  {decision:"approve"|"reject"|"needs_research", evidence_ids[], note}
GET /api/v1/workspaces/{id}/opportunities
PATCH /api/v1/workspaces/{id}/opportunities/{id}
  {stage, next_action_at, owner_id, version} // optimistic concurrency
POST /api/v1/workspaces/{id}/research-runs
  {geography, segment, signal_types[], max_cost}
POST /api/v1/workspaces/{id}/decisions/{id}/approve
  {scope, reason, expires_at} // human only, signed-in privileged actor
POST /api/v1/internal/jobs/source-ingest
  // service auth, replay protection, idempotent, not publicly accessible
```
Required standards: request ID, schema version, 4xx validation, 429 backoff, bounded retries, server-enforced permissions, pagination, audit events, provider timeouts and dead-letter queue. Public endpoints must not expose other tenants' IDs, data or private records.

## 6. WordPress production and support runbook
**Environment:** Separate dev/stage/prod with isolated WordPress DB, media and secrets. Document DNS, TLS, hosting, PHP, database, CDN/cache, email delivery, disaster-recovery owner and monitoring. Confirm whether IONOS VPS is selected before deployment.

**Theme/content:** Astra or approved equivalent, block patterns and child-theme changes in Git. Define types for finance product pages, location pages, directory profiles, educational articles, proof/case studies, legal/privacy/consent. Run editorial reviews for lending claims and CASL/PIPEDA rules. Use canonical URLs, redirects, sitemap, structured data, robots controls and accessibility checks.

**WordPress security:** least-privilege accounts, MFA, unique editor/admin roles, safe plugin allowlist, patch cadence, malware/WAF, rate limits and login protections; never push `.env`, wp-config secrets or contact exports into Git/Slack. Lock down WP REST endpoints by role; only approved server-to-server calls may access intake API.

**Deploy:** backup files/DB -> stage plugin/theme update -> smoke test forms, consent capture, CTAs, directory and analytics -> approve release in Slack -> controlled production deploy -> postdeploy smoke tests and cache purge -> record Git commit, approver, logs, and rollback point. Database/content rollbacks require restore plan, not merely reversing theme code.

## 7. CI/CD and release policy
Branches -> PR checks -> staging -> human approval -> production. Required checks: lint/typecheck, unit and integration tests, RLS isolation, schema compatibility, secrets scanning, dependency vulnerability review, build, API contract tests, synthetic-form tests. Tag releases and list every changed subsystem (WP, Next.js, Supabase, Railway, third-party adapters). Never run untargeted migrations against shared production Supabase or assume remote schema matches documentation.

Use staged rollout and feature flags for source providers and agent actions. If DB migration is not backward compatible, use expand/backfill/switch/contract strategy with restore rehearsals.

## 8. Slack-based support: channel taxonomy and ownership
- `#ck-tech-ops`: support intake, routine bugs, API/provider issues, daily triage.
- `#ck-deployments`: PR/release notices, change approvals, smoke-test signoff, rollback notices.
- `#ck-incidents`: P0/P1 incident bridge, single incident commander, timeline, stakeholder updates, closure.
Optional later `#ck-data-quality` for verification and data feed reviews, `#ck-product-feedback` for pilot observations.

**GitHub issue is canonical** for every work item: ID, type, severity, environment, affected tenants (sanitized), customer impact, reproduction, logs/trace reference, owner, workaround, PR, release, verification and closure. Slack thread links to issue; secrets and personal borrower records never posted.

**Roles:** product owner approves requirements and releases; tech lead owns architecture; on-call engineer owns triage; security lead handles exposures; data steward reviews sources and accuracy; release manager handles gate/rollback. Define named backups and on-call rota before launch.

**Severity/SLO targets (proposals, not current service commitments):**
| Severity | Examples | Acknowledge | Update |
|---|---|---|---|
| SEV1 | Cross-tenant disclosure, severe breach, total production outage | 15 minutes | 30 minutes |
| SEV2 | Intake data loss, financing pipeline unavailable, repeated job failures | 1 hour | 2 hours |
| SEV3 | Partial feature defect, data-feed degradation with workaround | 1 business day | Daily |
| SEV4 | Cosmetic, minor editorial, feature request | 2 business days | Per sprint |

Escalate privacy/security incidents immediately, preserve logs/evidence, revoke affected keys, assess reportable breach obligations with counsel. Do not require a Slack bot to autonomously take destructive recovery actions.

### Incident message template
```text
[SEV2] INC-YYYYMMDD-### — [component / short symptom]
Environment: production | Started UTC: ... | Impact: ...
Owner / commander: ... | Linked GitHub issue: ...
Evidence: monitored request IDs and dashboards (no credentials/PII)
Mitigation now: ... | Next update: ... | Rollback decision: ...
```
### Deployment message template
```text
[RELEASE REQUEST] REL-... | WordPress / app / DB / worker
PR(s) / commit: ... | Environment: staging -> production
Risk & changed integrations: ... | Tests / security checks: PASS...
DB backup/migration: ... | Rollback runbook: ...
Approver: ... | Operator: ... | Scheduled change window: ...
[RELEASE COMPLETE/ROLLED BACK] Production smoke test, metrics and release link
```

## 9. Monitoring and operational dashboards
Track uptime, 5xx rate, p95 API latency, WordPress form submission success, Next.js auth failures, Supabase RLS denials, DB connections/backups, queue depth, ingestion freshness, provider 429/5xx, credit/API spend, duplicate candidates, source citation completeness, contact consent, suppression misses and human-review backlog. Alert on **meaningful thresholds** using dedupe/routing rules and include runbook links. Do not publish private business data to Slack logs. Publish daily service health and weekly bug backlog/feature status.

## 10. Security, legal and data policy
Security principles: minimization, encryption in transit/at rest, retention and deletion policy, regional storage decision, access logging, tenant isolation, private prospect notes, vendor due diligence, least-privileged API keys, key rotation, backups and tested restoration. Apply Canadian privacy and outreach requirements (PIPEDA and applicable provincial rules; CASL for commercial electronic messages), applicable provincial mortgage licensing/advertising rules, and jurisdictional counsel review. Google Business Profile/Places and other third-party provider data must be used under current license, rate, storage/display and retention conditions. Do not scrape gated platforms or assume business listings authorize unsolicited marketing.

Agent safeguards: prompt-injection handling, untrusted web text as data only, no unrestricted SQL, no unapproved emails, lender submissions, payments, irreversible edits or bulk outreach. Explicit authorization scope, auditability, budget caps and kill switch.

## 11. Testing and release acceptance
**P0 gates** before live user onboarding:
1. Verified WordPress site and compliant capture/consent flow, staging/prod separation, backup/restore and tested rollback.
2. Canonical database/migration decision and measured cross-tenant zero-access tests.
3. Real evidence records, dedupe, provenance, stale-data handling and human verification queue.
4. Broker can view allowed accounts, record verified financing conversation, advance a persistent opportunity and see source evidence.
5. Synthetic/demo data unmistakably marked and never mixed with production-qualified leads.
6. Slack SEV escalation, GitHub ticket link, deployment approval, health checks, incident tabletop and recovery drill.
7. No secrets in client bundles, WordPress plugins, GitHub repo or Slack; provider quotas and spend limits configured.
8. Independent security/privacy and finance-claim review.

**Pilot measures:** verified relevant records, verified sponsor conversations, meeting conversion, false positives, pilot team activation/retention, integration cost per useful prospect, intake form delivery rate, investigation time and incidents. These are targets to measure, not evidence already achieved.

## 12. Phased execution plan
**Phase 0: architecture/governance (blocking)** — confirm WP host/theme, Clerk/auth routing, WordPress intake API boundary, canonical CRM/Supabase tenancy, source licenses, and ownership matrix. Record architecture decision records (ADRs).
**Phase 1: operational foundation** — staging infrastructure, GitHub Actions checks, Secrets Manager, monitoring, Slack channels and ticket templates, backup/restore, WordPress CMS basics.
**Phase 2: data/CRM pilot** — company/project ingestion with licensed APIs, provenance and review queue, RLS, broker intelligence cards, Kanban, intake routing and reporting.
**Phase 3: enrichment and conversion** — provider bake-off, prospect matching, Client Brain briefings, carefully approved follow-up automation, market-context views.
**Phase 4: AI executive assistant and monetization** — OODA Chief of Staff, agent execution approvals, subscription and lead-delivery billing, measured expansion.

## 13. Pending architectural decisions
- WordPress hosting (IONOS VPS or alternative), backup provider and restoration objective.
- Production WordPress theme (Astra proposed), allowed plugin list, directory data contract and editorial ownership.
- DNS/TLS and apex-to-www redirect for https://www.commercialkonnect.ca, plus the app subdomain; chosen broker SSO route.
- Canonical Mortgage Mix vs Atomic CRM schema, workspace key, how existing records migrate, and which app owns opportunities.
- Business listing vendor/API terms, verified BC coverage, budget limits and consent/legal boundaries.
- Slack workspaces, named on-call owners, deployment approvers and incident/security notification recipients.
- Provider-specific production quotas and observability instrumentation.

## 14. Change control
Edit this handbook and the README together when scope/architecture changes. Open a PR for review; do not equate documentation merge with deployment. Include decision log, feature status evidence, screenshots/tests for UI changes, and proof that WordPress is the production public frontend and Lovable remains prototype-only.

## 15. Public site canonical domain
**Public production website:** https://www.commercialkonnect.ca (WordPress). Use this URL for all published public CTAs, SEO canonical references and the technical support service inventory. Treat https://commercialkonnect.ca as an alias that should permanently redirect to https://www.commercialkonnect.ca. Configure WordPress Address/Site Address, SSL, DNS, search sitemap and cache/CDN accordingly. Deployment and DNS configuration are separate tasks and are **not** performed by this documentation change. Lovable remains prototype-only; the authenticated Next.js app uses a separately approved hostname.
