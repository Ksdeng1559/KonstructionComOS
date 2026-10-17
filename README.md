# KonstructionComOS

**Construction Intelligence & Capital Origination OS** — a multi-tenant B2B SaaS for discovering early construction opportunities, identifying project stakeholders, and managing financing outreach.

## Current status

This branch contains the application scaffold and a consolidated Claude Code implementation handoff. Client brains, live enrichment, GTM automation and success scorecards are proposed work unless verified in the actual code. The current documentation changes are tracked in [PR #2](https://github.com/Ksdeng1559/KonstructionComOS/pull/2).

## Planned MVP: British Columbia
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
Refactoring Mortgage Mix (`mix_*` tables in the live `amgknqnhiscryvcfeoyj` Supabase project) into the commercial-financing opportunity engine, fed by BC construction-project data as a new lead source — design approved, implementation underway. See `docs/superpowers/specs/2026-10-14-mortgage-mix-commercial-financing-design.md` for the tenancy unification, FK-convention decisions, and local-test harness (Vitest against the Supabase CLI's local stack). This supersedes the earlier `2026-10-14-clerk-orgs-rls-crud-design.md` schema-isolation plan, kept for history only.

## Parallel track: Atomic CRM construction-intelligence retrofit (separate repo)
A Notion product-definition doc (§26, locked 2026-10-14) specifies a *different* build — forking the existing Atomic CRM app at `G:\AI-Applications\atomic-crm` into a multi-tenant (`tenant_id`/RLS, Supabase Auth) construction-intelligence CRM for two internal pilot tenants (Eng & Associates financing workflow, GPC Development contractor-bid workflow), fed by the BuildData API. This does **not** target this repository and does not touch the Mortgage Mix workstream above — documented here only because the conflict with this repo's own stack was discovered during a Notion review. Full phased plan (Phase 0 Contract → Phase 5 Real-data gate, with explicit blocking gates for unresolved BuildData licence/key/scoring questions): `docs/superpowers/plans/2026-10-15-atomic-crm-construction-intelligence-retrofit.md`.

## In-progress design: GTM lead-source review queue
A doc-only branch (`docs/gtm-lead-source-playbook`, open PR #2) hands off a client-brain + offer + strategy-matching + review-queue workflow for converting construction-project signals into evidence-backed, human-reviewed opportunities. Source docs: `client.brain.md`, `docs/GTM_LEAD_SOURCE_PLAYBOOK.md`, `docs/GTM_ENRICHMENT.md`, `docs/GTM_WIREFRAME.md`, `docs/GTM_EXECUTION_LOOP.md`, `docs/GTM_GOALS_SUCCESS.md` (on that branch, not yet on `main`).

Brainstorming is underway on this repo's `main` to scope and design the first buildable slice. Scoped so far (not yet approved/implemented):
- First slice = pure TS strategy engine (`src/lib/gtm/`, CAP-01/02/03 only, categorical Research/Review/Ready/Hold output, no numeric scoring) + a review-queue UI (`/gtm`) — entirely mock-mode, two contrasting synthetic client-brain profiles, no persistence.
- Explicitly deferred: fact-confirmation forms, capital qualification Kanban, internal opportunity promotion, Today view, outcome/feedback capture — all named in the source docs as later steps.
- Depends on nothing from the Mortgage Mix or Atomic CRM tracks above; reuses none of their tenancy work since this slice has no DB yet.
- No spec file exists yet — this section is a status pointer for other sessions/tools picking up context, not a committed plan.

## Roadmap
See `docs/PRD.md` and `docs/ARCHITECTURE.md`. This is an MVP scaffold, **not** a production-ready financing, compliance or data-enrichment platform.

## Approved public frontend: ClearConnect (Lovable)

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

## Client intelligence and GTM workflow

The proposed workflow connects client understanding to evidence-backed business development:

1. **Understand the client:** goals, strengths, weaknesses, capabilities, capacity and preferred opportunities.
2. **Define the offer:** a service the client can deliver, supporting proof, qualification questions and next-step CTA.
3. **Discover project signals:** permitted construction records with source identity, event dates and coverage limits.
4. **Resolve and enrich:** verify projects, companies and stakeholder roles; add authorized relationship context and preserve unknowns/conflicts.
5. **Decide the pursuit:** recommend pursue, partner, nurture or pass, with Needs research when evidence is insufficient.
6. **Assign action:** identify account/pursuit owners and create verification, introduction or follow-up tasks.
7. **Qualify and progress:** record stakeholder-confirmed needs and move through guarded workflow stages.
8. **Measure and learn:** capture meetings, mandates and supported financial outcomes; propose reviewed improvements to the client brain and offers.

These are implementation requirements. The documentation and wireframes do not establish that the corresponding screens, integrations or live workflows exist.

### Implementation guide

| Document | What Claude Code should use it for |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Shared engineering, security and completion rules |
| [CLAUDE.md](CLAUDE.md) | Coding-agent entry point and workstream boundaries |
| [PRD](docs/PRD.md) | Product scope and MVP acceptance |
| [Architecture](docs/ARCHITECTURE.md) | Architecture baseline; reconcile tenancy with the approved Mortgage Mix design |
| [Mortgage Mix design](docs/superpowers/specs/2026-10-14-mortgage-mix-commercial-financing-design.md) | Current approved commercial-financing direction and workspace mapping |
| [client.brain.md](client.brain.md) | Client-profile template: goals, evidenced strengths, weaknesses, interests, exclusions and capacity |
| [GTM lead-source playbook](docs/GTM_LEAD_SOURCE_PLAYBOOK.md) | Segment strategies, evidence gates, qualification, promotion and attribution |
| [Enrichment process](docs/GTM_ENRICHMENT.md) | Identity resolution, company/stakeholder/relationship research, field evidence and reviewed results |
| [GTM wireframe](docs/GTM_WIREFRAME.md) | Queue, expandable briefing, verification forms, Kanban, responsive behavior and UI states |
| [Execution and learning loop](docs/GTM_EXECUTION_LOOP.md) | Offers, pursuit decisions, relationship ownership, Today tasks and outcome feedback |
| [Goals and success metrics](docs/GTM_GOALS_SUCCESS.md) | Goal ownership, baselines/targets, outcome definitions and scorecard requirements |
| [Frontend integration](docs/FRONTEND_INTEGRATION.md) | Public Lovable frontend, design alignment and migration boundaries |

Read the current checkout and package scripts before implementing. Older generic schema notes and plans are not evidence of completed functionality. In the approved Mortgage Mix design, `workspaces` is the tenant boundary and `organizations` represents business entities. Do not substitute the separate Atomic CRM `tenant_id`/Supabase Auth design.

### Client brain

The repository's `client.brain.md` is an **unpopulated reusable template**. Each actual client needs a private, versioned profile under verified workspace access, including:

- Identity, goals and success measures.
- Strengths with proof and business weaknesses/capability gaps.
- Ranked opportunity interests, territory, size and timing preferences.
- Exclusions, capacity, economics and relationship context.
- Evidence, review dates and approved learning changes.

Recommendations must explain **why this fits this client** and **what may prevent success**, citing the profile version and relevant project evidence. A client preference cannot override source rights, contact suppression or authorization. Do not commit real client profiles or private relationship notes to this public repository.

### Recommended user experience

Default to an opportunity queue with a selected evidence-and-action panel. Expand a project to review its briefing, evidence, stakeholders, enrichment results and activity. A separate Kanban tracks qualification progress. The Today view uses existing assigned tasks; Client Profile contains goals/offers, and Goals & Success shows evidenced outcomes.

Editable visual references:

- [Opportunity queue and briefing](docs/wireframes/gtm-opportunity-queue.svg)
- [Capital qualification Kanban](docs/wireframes/gtm-capital-kanban.svg)

The SVG records/counts are synthetic. Preserve construction lifecycle, review eligibility, pursuit disposition and qualification stage as separate states. A card move cannot establish financing demand, a mandate, lender approval or permission to send outreach.

### Success measures

Start with client-approved goals and a small outcome scorecard:

| Layer | Proposed measures | Interpretation |
| --- | --- | --- |
| Business outcomes | Qualified meetings held, signed mandates, realized fees where evidenced | The client's business results |
| Operating drivers | Suitable pursuits, due actions completed on time, matured pursuit-to-meeting conversion | Where to improve relevance or execution |
| Quality and economics | Reviewed evidence errors, cost per qualified meeting | Whether the workflow is accurate and sustainable |
| Product validation | Activation, retained use, paid-pilot renewal | SaaS success, separate from the client's outcomes |

Baselines and targets remain unknown until measured/confirmed. Show Not measured when source data is unavailable. Project budgets, loan principal, contact counts and enrichment volume are not realized fee revenue. Every displayed outcome should link to its authorized underlying records and metric definition.

### Recommended MVP build order

1. Confirm the actual data contract, then implement verified tenant mapping, restrictive RLS and cross-workspace denial tests before real data access.
2. Build one complete **synthetic finance slice**: client brain + confirmed offer → project evidence → mocked enrichment → explainable pursuit recommendation → verification task.
3. Add reviewed confirmation, relationship ownership, internal idempotent promotion and guarded capital Kanban.
4. Add Today actions and one evidence-backed qualified-meeting goal with actual-count drill-through.
5. Add outcome feedback and proposed profile/offer changes requiring review.
6. Enable bounded real-source/enrichment pilots only after adapter fields, rights, credentials, coverage and cost limits are verified.

Mock UI and pure logic can proceed while live integration gates remain unresolved. Reuse existing companies, contacts, tasks, notes and opportunities. Avoid duplicate CRM systems and keep the separately documented Atomic CRM workstream separate.

### Validation and completion

The current branch exposes these scripts:

```bash
npm run typecheck
npm run lint
npm run build
```

There is no `npm test` script in the inspected package file. Add an appropriate meaningful test harness in the implementation work rather than claiming planned tests already exist. Cover evidence gaps, entity ambiguity, duplicate/retried writes, guarded transitions, suppression, profile versions, outcome definitions and tenant isolation as relevant to the slice.

For each implementation PR, report actual changes, commands/results, manual UI checks, remaining gates and the next complete slice. Documentation-only updates do not establish passing runtime checks or completed live integration.
