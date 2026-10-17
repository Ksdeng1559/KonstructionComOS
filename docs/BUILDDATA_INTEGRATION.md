# BuildData API — BC Project Intelligence Integration Plan

Status: implementation specification; NOT connected, tested against an authenticated API, or deployed.
Source of truth: https://www.builddata.ca/openapi.json (OpenAPI 3.0.3; verify latest at implementation).
Owner: KonstructionComOS project intelligence + GTM workstreams.

## Objective
Ingest attributable, dated BC construction activity and create one canonical project intelligence core for distinct **Capital Origination**, **Contractor Opportunities**, and **Commercial Real Estate Relationships** workflows. A project signal is not an active mandate, financing requirement, bid invitation, or verified intent.

## Provider endpoint priority
P0: `/planning_application`, `/major_project`, `/development_permit`, `/permit` plus corresponding `/coverage`, `/stats`, and record-by-id methods where published.
P1: `/contractor`, `/property`, `/zoning`, `/zone`, `/assessment`, `/geocode`, `/reverse-geocode`.
P2: `/licence`, `/opening_soon`, `/inspection`, other available datasets and metadata.

**Before implementing** read the live OpenAPI operation definitions, parameters, models, pagination, authentication and errors. Generate TypeScript types from the current specification or validate manually at the boundary. Never infer that all datasets support the same filters, dates, record identifiers or coverage. Enumerate valid municipality slugs from each dataset's coverage endpoint; DO NOT assume all Metro Vancouver/Fraser Valley municipalities are covered.

## Architectural sequence and gates
0. **Dependency: security gate** — implement Clerk Organizations to verified server-side tenant identity mapping, restrictive Postgres RLS and two-org denial tests before serving real records and tenant-owned interactions. Provider ingestion may be prototyped with mocks independently.
1. **Provider contract** — keep API key server-only as `BUILDDATA_API_KEY`, configurable server-only base URL, timeout, typed responses, query validation, and pagination (including cursor behavior where applicable). Determine auth mechanism from live security schema; do not invent headers.
2. **Coverage/eligibility** — persist per-dataset, per-city coverage, counts, last-check time and unsupported-area status. Start with a measured BC pilot footprint; do not conflate geographic serviceability with data recency.
3. **Ingest** — schedules and bounded backfill; checkpoint by source/dataset/city and observed update field if supported. Apply rate limit headers, `Retry-After`, exponential backoff with jitter, concurrency controls, and daily quota budget. Handle 400/403/404/422/429/500/504 distinctly; a free-tier 403 on recent records is NOT proof that they do not exist. Free-tier records can have a 30-day first-seen delay.
4. **Normalize** — immutable raw source payload and provider source ID with dataset, municipality, collection time, publisher/source URL, attribution/licence, timestamps, raw hash, and transformation version. Use idempotent upserts. Preserve distinct permits/planning applications on the same parcel; address/coordinate matches suggest linkage, never justify blind merges.
5. **Intelligence core** — canonical project, site/parcel, source records, project events, companies, roles, optional people, stakeholder claims, relationship evidence, project stage history, and tenant opportunity/interaction records. Keep project lifecycle stage separate from sales Kanban.
6. **Enrichment** — company resolution with alias/registry/address evidence; contacts and decision-maker roles only with corroborating sources, last verified timestamp, confidence and legal basis. Never equate named applicant/contractor with economic owner or financing decision-maker.
7. **GTM scoring** — assess (a) project/service fit 25%, (b) timing 20%, (c) stakeholder verification 20%, (d) evidence of commercial need 20%, (e) freshness 15%. These are configurable hypothesis weights, not predictive validation. Maintain three-state commercial need: unknown / hypothesized / confirmed, with reviewer and evidence; scoring must not silently promote hypotheses to confirmed opportunities. Add specialty, territory, budget-band, property type and capital size requirements from client.brain.md.
8. **Delivery** — expandable project briefing with dated source links and uncertainty, enrichment progress, change timeline, role-specific opportunity score explanation, shortlist, tenant-isolated persistent Kanban and next action. Each client sees only permitted shared project data and their own notes/leads/engagements.
9. **Monitoring** — ingest success/failure, new/changed records, age distribution, match-precision review, provenance completeness, source SLA, false-match sampling, quota usage, enrichment cost, and confirmed conversations per 100 projects.

## Proposed normalized tables (align with existing schema; no migration has been applied)
- `provider_sources`: provider/dataset/source_id uniqueness; licence and attribution; immutable raw payload/hash; seen timestamps.
- `source_coverage`: provider/dataset/municipality coverage evidence and fetched_at.
- `sites` and `project_site_links`: normalized address, parcel if verified, geocode precision.
- `project_events`: source-linked chronological planning, approvals, permit, inspection, award/status observations.
- `project_organizations`: organization + role + supporting source + confidence + effective dates.
- `enrichment_claims`: claim type/value, evidence, verification state, reviewer, expiry.
- `client_brain_profiles`: tenant-specific ideal customer/project fit, priorities and disqualifiers; versioned.
- `opportunity_scores`: tenant + project + profile version + factor evidence/score; explainable.
- `tenant_project_opportunities`: lifecycle-independent Kanban, qualification, action, last contact, outcome.
- `ingestion_runs` and `ingestion_checkpoints`: job errors, counts, last cursor/time, quota headers.

Use existing project/stakeholder/opportunity tables where practical and migrate additively; do not build a parallel competing registry. Tenant-private entities must enforce RLS and server-derived organization membership.

## Client Brain contract
A client.brain.md (or validated equivalent stored as a tenant profile) includes:
- Company and segment; service territory, project/property and financing/trade specialties
- Ideal project size/value and minimum opportunity threshold
- Current capabilities, capacity, strengths and weaknesses
- Priority outcome: meeting, finance discussion, bid invitation, mandate or referral
- Target decision-maker roles and preferred outreach channels
- Exclusions, competitors, conflicts, CASL/privacy eligibility flags and verification rules
- KPI targets: verified projects reviewed, qualified introductions, time saved, paid conversion, retention
Maintain version history and explicitly distinguish client-entered facts, inferences and unknowns.

## Acceptance criteria
- CI tests with recorded/mock fixture variants for success, empty page, pagination, invalid city (422), 403 free-tier restriction, 429 retry, 504 timeout, duplicate IDs, changed records and same-address multiple projects.
- Dataset coverage discoverable before city is offered; project source links and time provenance visible.
- Idempotent re-import yields no duplicate records or duplicate event alerts.
- No tenant can access another's profiles, notes, opportunities, scores, or contacts in two-org RLS tests.
- Stage is not inferred from sales Kanban movement; financing need defaults to unknown.
- At least 100 *real and independently spot-verified* projects in a bounded pilot area before any "live opportunity" marketing claim.
- Security, privacy, provider redistribution rights and municipal attribution obligations reviewed before public multi-tenant exposure.
- Evidence-based pilot metrics: record precision, sponsor/decision-maker confirmations, attributable meetings, time saved and retention; no promises of exclusive leads.

## Implementation work packages for Claude Code
A. Inspect and document API contract + coverage and licensing; propose schema delta.
B. Implement secure provider client, normalized mapper, checkpoints and fixture-based unit tests.
C. Implement background ingestion for one measured municipality and one dataset, validate idempotency.
D. Extend multi-tenant project briefings and differentiated opportunity boards after RLS gate.
E. Add client.brain profile scorer, research queue, stakeholder enrichment and human-review workflow.
F. Expand datasets/cities only when accuracy, freshness, quota and licensing permit.

## Product and licensing rules
BuildData is an upstream evidence provider, not a source of proven purchasing intent. Provider promotional prices, aggregate record counts, and coverage are not service-level guarantees. Verify contractual rights to cache, expose, export and resell derived records and municipality attribution rules. Store source and licence metadata per assertion. Respect CASL/PIPEDA, data minimization, deletion/suppression, and manual review of consequential communications.

Related: `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/FRONTEND_INTEGRATION.md`, `CLAUDE.md`, `AGENTS.md`.
