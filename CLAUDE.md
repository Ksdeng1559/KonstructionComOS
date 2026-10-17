# CLAUDE.md — KonstructionComOS Claude Code briefing

You are implementing a **British Columbia-first, multi-tenant B2B construction intelligence and commercial financing SaaS**, not a generic lead list.

## Required reading
1. `AGENTS.md` (model-independent safety and engineering rules)
2. `README.md` (onboarding and current implementation truth)
3. `docs/PRD.md` (scope, priorities and definition of done)
4. `docs/ARCHITECTURE.md` (security, tenant isolation and ingestion pipeline)
5. `docs/FRONTEND_INTEGRATION.md` (approved public frontend and design mapping)
6. `docs/GTM_LEAD_SOURCE_PLAYBOOK.md` (lead-source signals, GTM strategies, evidence gates and implementation sequence)
7. `docs/GTM_WIREFRAME.md` (recommended layouts, SVG references, responsive states and UI acceptance checks)
8. `docs/GTM_ENRICHMENT.md` (identity resolution, company/stakeholder/relationship enrichment, field evidence, provider jobs and review)
9. `client.brain.md` (client-profile template: goals, strengths, weaknesses, preferred opportunities, constraints and reviewed learning)

## Public frontend is already chosen
Use **https://clearconnectcom.lovable.app/** as the marketing and demo frontend. Lovable editor/source: `https://lovable.dev/projects/136ade9c-5e7f-4aea-95d7-de34af9aabc0`. Preserve its UX and navigation.

**Important:** Lovable source is Vite/React Router/Tailwind 3, while this repository is Next.js App Router/React 19/Tailwind 4. Do not claim they share a codebase or transfer dependencies blindly. Prefer public frontend + linked authenticated Next.js app, then progressively align design and port components. The front-end integration remains documentation/planning, not a connected deployment.

## Current files
- `src/app/page.tsx`: synthetic executive dashboard
- `src/lib/demo.ts`: synthetic projects
- `supabase/schema.sql`: organization/project/stakeholder/opportunity schema; RLS enabled but not wired to Clerk
- `docs/`: requirements, architecture and frontend integration
- `.github/workflows/ci.yml`: basic checks; not evidence that checks passed

## First coding workstream
Implement **Clerk Organizations + verified server-side org mapping + complete Supabase RLS policies + project CRUD + denial tests across two organizations**. Keep demo records clearly labeled and avoid mixing them into live tables. Only then wire production project listings and public CTAs.

## Working style
- Inspect the file tree, status and package scripts before changing code.
- Follow existing TypeScript/Next.js conventions; validate inputs at trust boundaries.
- Prioritize one end-to-end slice at a time over speculative architecture.
- Explain any authentication, schema, adapter or design-system decisions in docs.
- Run typecheck/lint/build/tests where available. Do not claim unexecuted checks pass.
- Never log or commit secrets/PII. CASL/PIPEDA and lending/security obligations require explicit review.
- End each task with changes, test evidence, limitations and exact next step.

## GTM opportunity workstream

For lead-source discovery and opportunity activation, follow [docs/GTM_LEAD_SOURCE_PLAYBOOK.md](docs/GTM_LEAD_SOURCE_PLAYBOOK.md). Read the current approved Mortgage Mix design before schema work: `workspaces` is the tenant boundary and `organizations` stores business entities. Reconcile older generic schema notes against that design and the actual checkout. The Atomic CRM retrofit is a separate repository; do not merge its auth, tenancy or DSCOS scoring into this workstream.

Implement one source-independent financing slice first: project evidence → segment/strategy fit → research/review queue → verification task → human-approved internal promotion. Keep unknown financing needs and appointment status explicit. Reuse existing entities, show source/date and reasoning, deduplicate opportunities and test isolation/retries. Keep live source and external activation gates closed until verified. These instructions describe proposed work, not completed integration.

## Client brain

Use `client.brain.md` as the structured profile/template contract for GTM fit and enrichment scope. Store active, versioned client profiles privately under verified workspace access; never commit confidential client facts. Tie recommendations to confirmed interests, evidence-backed strengths, capacity and exclusions. Preserve Unknown states and propose feedback changes for authorized review rather than silently rewriting preferences.

## GTM execution loop

Read [docs/GTM_EXECUTION_LOOP.md](docs/GTM_EXECUTION_LOOP.md): confirmed offer playbook → explainable pursuit/partner/nurture/pass decision (or Needs research) → relationship ownership → Today action queue → evidenced outcomes and reviewed client-brain learning. Implement in that MVP order, reuse CRM tasks/entities and keep recommendation, eligibility and qualification distinct.

## Goals and success

Read [docs/GTM_GOALS_SUCCESS.md](docs/GTM_GOALS_SUCCESS.md). Tie goals to the client brain and offers; measure qualified meetings, signed mandates and evidenced economics where available. Keep unknown baseline/targets explicit and client outcomes separate from SaaS metrics. Start with one meeting goal and evidence-linked actual/drill-through.
