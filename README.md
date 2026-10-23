# commercialKonnect

> **Frontend decision (October 21, 2026):** WordPress is the planned production public website at **https://www.commercialkonnect.ca** (SEO, borrower intake, directory, broker landing pages). Lovable is used solely for prototyping/design exploration; it is not the production frontend. The authenticated broker application remains a separate Next.js product. Read [Technical Implementation & Slack Operations](docs/TECHNICAL_IMPLEMENTATION_AND_SLACK_OPS.md) and [Architecture](docs/ARCHITECTURE.md). This documents the target; it does not claim deployment.

**Commercial & Business Financing, Connected.** KommercialConnect is the proposed borrower-facing brand for a Canadian B2B platform that connects businesses and commercial property owners with finance brokers. The platform is supported by a construction intelligence and capital origination system that discovers early project opportunities, identifies stakeholders, and manages financing workflows.

> **Repository/product status:** The GitHub repository is still named `KonstructionComOS`. KommercialConnect is the proposed public brand; domain availability and trademark clearance are not confirmed. The application remains an MVP scaffold, and public-facing brand changes have not yet been implemented in the app.

## MVP: British Columbia
- Project intelligence registry with construction stage, estimated budget, source provenance, and confidence
- Pipeline for commercial mortgage/financing opportunities
- Stakeholder and company directory (developers, contractors, architects, property owners)
- Tenant-isolated workspace data with Clerk authentication and Supabase Postgres RLS
- Qualified project ranking, dashboard, and CSV import/export
- Account-based outreach workflows with compliance review (CASL/PIPEDA)

## Stack
- Next.js App Router, TypeScript, Tailwind CSS
- Clerk authentication and Organizations
- Supabase PostgreSQL with row-level security (RLS)
- shadcn/ui compatible component architecture
- Vercel (frontend), Supabase (database); optional Railway workers

## Local setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and add credentials.
3. Run `supabase start` (Supabase CLI, requires Docker) to bring up the local Postgres/Auth/Studio stack for development and tests. The CLI is **not** linked to the remote project — no personal access token available in this environment — so `supabase link`/`db push` are not used.
   - **If Docker/local stack isn't available or has port conflicts:** point `NEXT_PUBLIC_SUPABASE_URL` at the live project (`https://amgknqnhiscryvcfeoyj.supabase.co`) instead and skip `supabase start`. This project hosts a live multi-tenant platform (Mortgage Mix + RIOS) under `public` — KonstructionComOS now builds directly on that schema (see workstream below). Still never run untargeted SQL or migrations against it outside the Supabase MCP tool's `apply_migration`.
4. Apply `supabase/schema.sql` to the local stack via `supabase db reset`, or to the live Supabase project via the Supabase MCP tool's `apply_migration`. Do not paste schema SQL into the dashboard SQL editor for the live project.
5. Run `npm run dev`.
6. Configure Clerk organizations. Keep the database service-role key **server-only**.

The dashboard and demo dataset work without connected credentials. Production persistence requires authenticated API endpoints, JWT validation and RLS policies described in `docs/ARCHITECTURE.md`.

## Current workstream
Refactoring Mortgage Mix (`mix_*` tables in the live `amgknqnhiscryvcfeoyj` Supabase project) into the commercial-financing opportunity engine, fed by BC construction-project data as a new lead source — design approved, implementation **not yet started**. See `docs/superpowers/specs/2026-10-14-mortgage-mix-commercial-financing-design.md` for the tenancy unification, FK-convention decisions, and local-test harness (Vitest against the Supabase CLI's local stack). This supersedes the earlier `2026-10-14-clerk-orgs-rls-crud-design.md` schema-isolation plan, kept for history only.

**2026-10-17 planning update.** Live Supabase check confirmed zero implementation of the spec above: no `construction_projects` table, no `workspace_id` on any `mix_*` table, no `clerk_org_id` on `workspaces`, no `current_workspace_id()` helper. Two corrections to the spec's own assumptions: (1) `mix_leads` (4 rows) and `mix_opportunities` (16 rows) are **not** empty as the spec claimed — the Phase 0 backfill-to-default-workspace step needs to actually run against this real data, not treat it as a no-op; (2) a stale, abandoned `konstruction` schema (RLS enabled, zero policies, dead) remains from the superseded schema-isolation plan — flagged for cleanup, not yet dropped. Decided next concrete slice: wire the real BuildData API (`https://api.builddata.ca`, free tier, BC construction permits) into the approved `construction_projects`/`mix_opportunities` schema — chosen over building a command-center/pipeline UI first, since real data should exist before building a UI to show it. A detailed implementation plan for this slice is in progress. The broker-facing landing-page pilot-signup capture (Klick2Client/Notion spec) is confirmed explicitly gated behind internal-pilot readiness per that product doc — intentionally not being built yet.

## Parallel track: Atomic CRM construction-intelligence retrofit (separate repo)
A Notion product-definition doc (§26, locked 2026-10-14) specifies a *different* build — forking the existing Atomic CRM app at `G:\AI-Applications\atomic-crm` into a multi-tenant (`tenant_id`/RLS, Supabase Auth) construction-intelligence CRM for two internal pilot tenants (Eng & Associates financing workflow, GPC Development contractor-bid workflow), fed by the BuildData API. This does **not** target this repository and does not touch the Mortgage Mix workstream above — documented here only because the conflict with this repo's own stack was discovered during a Notion review. Full phased plan (Phase 0 Contract → Phase 5 Real-data gate, with explicit blocking gates for unresolved BuildData licence/key/scoring questions): `docs/superpowers/plans/2026-10-15-atomic-crm-construction-intelligence-retrofit.md`.

## In-progress design: GTM lead-source review queue
A doc-only branch (`docs/gtm-lead-source-playbook`, open PR #2) hands off a client-brain + offer + strategy-matching + review-queue workflow for converting construction-project signals into evidence-backed, human-reviewed opportunities. Source docs: `client.brain.md`, `docs/GTM_LEAD_SOURCE_PLAYBOOK.md`, `docs/GTM_ENRICHMENT.md`, `docs/GTM_WIREFRAME.md`, `docs/GTM_EXECUTION_LOOP.md`, `docs/GTM_GOALS_SUCCESS.md` (on that branch, not yet on `main`).

**Video sales workflow:** [Commercial & Business Financing Video Sales Workflow](docs/COMMERCIAL_FINANCING_VIDEO_SALES.md) defines the commercial mortgage and business-financing VSL sequence, audience-specific scripts, qualification and attribution measures, privacy safeguards, and staged Dubb/Sendspark/Hippo provider evaluation. This is GTM/product guidance; video features are not implemented in the app.

Brainstorming is underway on this repo's `main` to scope and design the first buildable slice. Scoped so far (not yet approved/implemented):
- First slice = pure TS strategy engine (`src/lib/gtm/`, CAP-01/02/03 only, categorical Research/Review/Ready/Hold output, no numeric scoring) + a review-queue UI (`/gtm`) — entirely mock-mode, two contrasting synthetic client-brain profiles, no persistence.
- Explicitly deferred: fact-confirmation forms, capital qualification Kanban, internal opportunity promotion, Today view, outcome/feedback capture — all named in the source docs as later steps.
- Depends on nothing from the Mortgage Mix or Atomic CRM tracks above; reuses none of their tenancy work since this slice has no DB yet.
- No spec file exists yet — this section is a status pointer for other sessions/tools picking up context, not a committed plan.


**Planned AI Chief of Staff (OODA Loop):** [Decision framework and implementation specification](docs/OODA_CHIEF_OF_STAFF.md) applies **Observe → Orient → Decide → Act** to Mission Control, including a daily executive briefing, evidence-backed top-three actions, human approval gates, agent execution audit and outcome feedback. [Notion source](https://app.notion.com/p/3ff9e94cf0a4810a857bfb686383b314). This is a product design, **not yet implemented**.

## Roadmap
See `docs/PRD.md` and `docs/ARCHITECTURE.md`. The evidence-backed market problem hypotheses and validation implications are summarized in [`docs/PRODUCT_MARKET_FIT_EVIDENCE.md`](docs/PRODUCT_MARKET_FIT_EVIDENCE.md); segment features and benefits are in [`docs/FEATURES_AND_BENEFITS.md`](docs/FEATURES_AND_BENEFITS.md). This is an MVP scaffold, **not** a production-ready financing, compliance or data-enrichment platform.

**Planned research feature — multi-agent provider evaluation:** Separate research agents will test Exa, Tavily, and Parallel on the same BC project-signal queries, output schema, and research budget, with manual research as a baseline. The evaluation will compare source-backed accuracy, relevance, freshness, duplicates, review time, reliability, and cost per verified project. **This is a plan only; no provider integration or agent bake-off is implemented.** See [`docs/EXA_RESEARCH_INTEGRATION.md`](docs/EXA_RESEARCH_INTEGRATION.md) for the test protocol, safeguards, and rollout gates.

## Public brand and frontend status

**Proposed borrower-facing brand:** commercialKonnect — canonical public site: **https://www.commercialkonnect.ca** — “Commercial & Business Financing, Connected.” Use this brand for business/property-owner acquisition, financing intake, broker matching, consent, and borrower status communication once validated and implemented.

**Operating platform:** KonstructionComOS remains the construction intelligence and broker operations layer: project signals, stakeholder discovery, enrichment, human-reviewed qualification, broker workflows, and outcome tracking. The intended handoff passes only the data needed for routing and qualification, with consent and source provenance.

The current ClearConnect/Klick2Client frontend below is an existing prototype and design source. It has not been rebranded or integrated as KommercialConnect. Domain registration, trademark clearance, and legal/compliance review remain outstanding.

## Legacy Lovable frontend — prototyping only

> **Superseding architecture decision:** The Lovable Vite/React site below is a historical prototype and design reference, not the production frontend. WordPress is the selected public-facing platform; do **not** implement the older directions below to make Lovable the public production application. Preserve these legacy notes only for migration/context. See docs/TECHNICAL_IMPLEMENTATION_AND_SLACK_OPS.md.


**Source website:** https://clearconnectcom.lovable.app/  
**Editable Lovable project:** https://lovable.dev/projects/136ade9c-5e7f-4aea-95d7-de34af9aabc0

**Product decision:** Use the existing ClearConnect/"Klick2Client Construction Intelligence" Lovable application as the **public-facing frontend and design source** for KonstructionComOS. Preserve its navigation and UX: Product, How It Works, Opportunities, For Brokers, Coverage, Resources, Pricing, Request Demo, Privacy and Terms. Preserve its Opportunity Explorer, illustrated BC financing journeys, demo/early-access conversion and existing lead handling unless explicitly migrated and tested.

**Verified Lovable source stack:** Vite + React 18 + TypeScript + Tailwind 3 + shadcn/ui + React Router, with existing Supabase integration files. **Current GitHub scaffold stack:** Next.js 15 + React 19 + Tailwind 4. These are *different* apps; a published URL alone is not an importable frontend. **Do not claim integration, code synchronization, unified auth or deployment is complete.**

**Integration strategy (recommended):**
1. Treat ClearConnect as the public marketing / demo frontend. Retain its existing code and publication while the SaaS backend is built.
2. Use the GitHub KonstructionComOS repository as the source of truth for the authenticated B2B SaaS product and domain model; do not replace the existing Next.js project with the Lovable/Vite project by copying files wholesale.
3. Link public "Sign In" / "Launch App" CTAs to the future authenticated app URL once deployed, not an unrelated CRM destination. Keep existing production CTAs working until transition.
4. Move shared design tokens, typography, brand assets, UI patterns and reusable opportunity concepts from the Lovable project to Next.js incrementally, reconciling Vite/React Router dependencies and Tailwind versions.
5. If a **single codebase** is preferred, plan and test a deliberate Vite-to-Next.js migration as a separate change; compare the risk/cost with keeping separate public app and SaaS app.
6. Validate organization isolation, Clerk/Supabase integration, demo vs verified data boundaries, lawful contact handling, analytics and cross-domain navigation before marking integrated.

**Implementation reference:** [docs/FRONTEND_INTEGRATION.md](docs/FRONTEND_INTEGRATION.md). Coding agents should read it alongside [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md).


**Planned GTM enrichment alternative — Deepline:** Evaluate [getaero-io / Deepline](https://github.com/getaero-io) for company and contact enrichment, decision-maker discovery, signal research and lead qualification alongside existing Exa/Tavily/Parallel options. This is **documentation and a proposed opt-in provider bake-off only**, not an implemented integration. See [`docs/DEEPLINE_GTM_ENRICHMENT_ALTERNATIVE.md`](docs/DEEPLINE_GTM_ENRICHMENT_ALTERNATIVE.md) for adapter design, BC sample evaluation, compliance safeguards, cost controls and adoption gates.


**Planned unified GTM tool gateway — Treg:** Evaluate [Treg](https://github.com/superdesigndev/treg) as an optional agent-facing catalog/proxy for third-party data and team-owned tools. Benchmark Treg-mediated enrichment against direct Exa/Tavily/Parallel routes and Deepline workflows; keep source provenance, spend controls, tenant privacy, human review and direct-provider fallback. **Planning only; not installed or production-integrated.** See [`docs/TREG_GTM_DATA_GATEWAY.md`](docs/TREG_GTM_DATA_GATEWAY.md).


## GTM enrichment adapter — engineering status (October 20, 2026)

The vendor-neutral GTM provider adapter **has been scaffolded on a separate feature branch**, not merged into `main` or deployed. It is intended to give Chief of Staff and GTM agents a consistent interface while comparing enrichment providers without lock-in.

- **Implementation branch:** [`feature/gtm-provider-adapter`](https://github.com/Ksdeng1559/KonstructionComOS/tree/feature/gtm-provider-adapter)
- **Source:** [`src/lib/gtm/providers/`](https://github.com/Ksdeng1559/KonstructionComOS/tree/feature/gtm-provider-adapter/src/lib/gtm/providers)
- **Handoff:** [GTM provider adapter implementation](https://github.com/Ksdeng1559/KonstructionComOS/blob/feature/gtm-provider-adapter/docs/GTM_PROVIDER_ADAPTER_IMPLEMENTATION.md)
- **Provider candidates:** Treg (tool gateway), Deepline (GTM enrichment workflows), Exa, Tavily, Parallel and manual baseline.
- **Implemented in branch:** TypeScript contract, provider registry, capability validation, explicit feature flags (off by default), basic response validation, per-request spend-cap checks and mandatory review flags.
- **Not implemented:** Vendor API calls, runtime tenant authorization, verified vendor pricing, persistence/audit ledger, automated tests, routing/approval UI or production integration. The scaffold's spend cap does not replace pre-call billing authorization.

**Next steps:** Review upstream API terms and data rights; implement and test one server-side provider adapter behind a flag; compare 50 BC companies/projects against direct providers and manual research; add authenticated tenant scoping, Supabase provenance/usage persistence, consent/suppression controls and human approval before any outbound or broker routing. Do not expose the scaffold as a production API or assume a public construction signal proves financing need.


## Claude Code handoff — OODA Chief of Staff implementation

The detailed phased engineering plan is maintained in the [feature/gtm-provider-adapter README](https://github.com/Ksdeng1559/KonstructionComOS/blob/feature/gtm-provider-adapter/README.md#claude-code-execution-plan--gtm-enrichment--ooda-chief-of-staff). **Claude Code should check out that feature branch and read its execution plan**, together with `AGENTS.md`, `CLAUDE.md`, `docs/OODA_CHIEF_OF_STAFF.md`, and the provider/OODA pipeline documents on that branch. The plan sequences tenancy and real-data gates, provider evaluation, persistent OODA decisioning, approval-controlled agent actions, dashboard work and regression testing. The branch contains **prototypes only**, not a production integration; do not merge before review and verified tests. First deliver an authorized, sourced BC prospect → Signal → Orientation → needs-review proposal → approved internal-only action → audited outcome vertical slice.
