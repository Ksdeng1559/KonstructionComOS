# CLAUDE.md — KonstructionComOS Claude Code briefing

You are implementing a **British Columbia-first, multi-tenant B2B construction intelligence and commercial financing SaaS**, not a generic lead list.

## Required reading
1. `AGENTS.md` (model-independent safety and engineering rules)
2. `README.md` (onboarding and current implementation truth)
3. `docs/PRD.md` (scope, priorities and definition of done)
4. `docs/ARCHITECTURE.md` (security, tenant isolation and ingestion pipeline)
5. `docs/FRONTEND_INTEGRATION.md` (approved public frontend and design mapping)

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

## GTM outreach continuation

Read [docs/gtm/OUTREACH_SYSTEM.md](docs/gtm/OUTREACH_SYSTEM.md) and [docs/gtm/CLAUDE_IMPLEMENTATION.md](docs/gtm/CLAUDE_IMPLEMENTATION.md) before changing outreach behavior. The pure planner in `src/lib/gtm/outreach.ts` is implemented; UI, persistence, live adapters, sending and booking are not. Keep platform-sales, broker-origination and contractor-growth motions separate. Do not interpret a manual-action recommendation as authorization to send. Use `npm run test:gtm` for the planner regression suite; reconcile the separate strategy/review PR and current Mortgage Mix design before integration.

