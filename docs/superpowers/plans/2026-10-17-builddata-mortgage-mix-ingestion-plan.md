# BuildData API ingestion → Mortgage Mix (Phase 0 + Phase 1) — implementation plan

Date: 2026-10-17
Status: **superseded same day — kept for history only.** Written without knowledge of 6 other open PRs on this repo, including PR #4 (`feature/builddata-integration-spec`, `docs/BUILDDATA_INTEGRATION.md`), which specifies a richer, different BuildData architecture (multi-table provenance/intelligence core vs. this doc's single `construction_projects` table) and which PR #7's own compatibility notes name as the authoritative BuildData contract to reuse. See `docs/superpowers/plans/2026-10-17-builddata-pr4-reconciled-plan.md` for the reconciled replacement. Tenancy-backfill findings below (real row counts, dead `konstruction` schema, `security definer` requirement on `current_workspace_id()`) remain valid ground truth and carry forward into the reconciled plan.
Implements: `docs/superpowers/specs/2026-10-14-mortgage-mix-commercial-financing-design.md` (Phase 0 tenancy backfill + FK cleanup, Phase 1 `construction_projects`)
Supersedes planning assumptions in that spec where live-system verification (below) found them wrong.

## Context

The Mortgage Mix spec was approved 2026-10-14 but zero implementation has landed. A live check of `amgknqnhiscryvcfeoyj` on 2026-10-17 confirmed: no `construction_projects` table, no `workspace_id` on any `mix_*` table, no `clerk_org_id` on `workspaces`, no `current_workspace_id()` function. Two corrections to the spec's own assumptions:

1. `mix_leads` (4 rows) and `mix_opportunities` (16 rows) are **not** empty as the spec claimed — the backfill steps below run against real data, not a no-op.
2. A stale `konstruction` schema (RLS enabled, zero policies, dead) remains from the superseded `2026-10-14-clerk-orgs-rls-crud-design.md` plan. **Held for a separate, later explicit cleanup — not touched by this plan.**

Chosen next slice: wire the real BuildData API (`https://api.builddata.ca`, free tier, BC construction permits) into this schema. A command-center/pipeline UI and the broker-facing landing-page pilot-signup capture (Klick2Client/Notion spec, gated behind internal-pilot readiness per that doc) are both explicitly deferred — not part of this plan.

## Scope decisions (resolved, not open)

- **FK cleanup is bundled in.** Both halves of the spec's "Phase 0" — tenancy backfill AND `mix_leads`/`mix_opportunities` FK cleanup — ship together in this plan.
- **Default workspace** for backfilling existing rows: name `Eng & Associates`, slug `eng-associates`, vertical `mortgage_mix`, `onboarding_status = 'legacy_skip'`.
- **`construction_projects` gets two additions** beyond the spec's original DDL: `raw_source_payload jsonb` (keeps the original BuildData record verbatim, so re-mapping later doesn't cost another API call against the 100/day cap) and a dedup key via `source_record_id text` (BuildData's own permit record ID, more reliable than URL) — exact uniqueness constraint finalized once `scripts/builddata-sample.ts` reveals the real field name.
- **Service-role client is used twice**, as an accepted, explicitly documented exception to `AGENTS.md`'s "one legitimate use" framing: the existing Clerk webhook, and now the ingestion script (no Clerk session exists in a standalone script).
- **Clerk is not wired into the app shell** (no `middleware.ts`, no `<ClerkProvider>` found anywhere in the repo). Out of scope for this plan. The Server Action write path is written and unit-tested against fake Clerk-shaped JWTs only; real end-to-end Clerk auth is separate, later work.
- **`konstruction` schema drop is held.** Not executed as part of this plan.

## Migration sequence

Each goes in `supabase/migrations/*.sql` (for local `supabase db reset` parity) and as the matching remote `apply_migration` call, in this order:

**M1 — `workspaces.clerk_org_id`**
```sql
alter table public.workspaces add column clerk_org_id text unique;
```

**M2 — `current_workspace_id()` helper (must be `security definer`)**
```sql
create or replace function public.current_workspace_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select id from public.workspaces
  where clerk_org_id = (auth.jwt() ->> 'org_id')
  limit 1
$$;
```
Must be `security definer`: `workspaces` already has an RLS policy from the unrelated Era-3 RIOS auth model (`id = rios_workspace_id()`, Supabase-native `auth.uid()`). A non-definer function's internal lookup would be subject to that policy and silently always return `NULL` for Clerk-authenticated callers, making every new tenancy policy fail-closed. Do not touch or reuse `rios_workspace_id()` — confirmed unrelated.

**M3 — add `workspace_id` (nullable) to the 9 `mix_*` tables**
`mix_leads`, `mix_opportunities`, `mix_campaigns`, `mix_campaign_sends`, `mix_conversations`, `mix_relationship_scores`, `mix_agent_runs`, `mix_knowledge_assets`, `mix_outreach_messages` — each gets `workspace_id uuid references public.workspaces(id)`.

**M4 — seed default workspace + backfill**
```sql
insert into public.workspaces (name, slug, vertical, onboarding_status)
values ('Eng & Associates', 'eng-associates', 'mortgage_mix', 'legacy_skip')
on conflict (slug) do nothing;

update public.mix_leads set workspace_id = (select id from public.workspaces where slug = 'eng-associates') where workspace_id is null;
-- repeat for all 9 tables
```
Verify via read-only SQL right after (not a Vitest case — a fresh local reset starts empty, so there's nothing to reproduce locally; this is checked once, manually, against real remote data):
```sql
select count(*) from mix_leads where workspace_id is null; -- expect 0
-- repeat for all 9 tables
```

**M5 — set `NOT NULL`** on all 9 tables' `workspace_id`, only after M4 verification confirms zero NULLs.

**M6 — RLS policies**, one `FOR ALL` permissive policy per table:
```sql
create policy workspace_isolation on public.mix_leads
  for all
  using (workspace_id = current_workspace_id())
  with check (workspace_id = current_workspace_id());
-- repeat for all 9 tables
```
Coexists with existing `service_role`-bypass policies (permissive policies OR together). Side effect, intended: this is what gives `mix_conversations` and `mix_relationship_scores` their first real policies (currently RLS-enabled-zero-policies, fully locked).

**M7 — `mix_leads` FK cleanup**
```sql
alter table public.mix_leads add column contact_id uuid references public.contacts(id);
alter table public.mix_leads add column company_id uuid references public.organizations(id);
```
Backfill: for each existing `mix_leads` row, upsert a `contacts` row from its inline `name`/`email`/`city`, link `contact_id`. Leave `company_id` null — no company data exists to backfill from (per spec). Inline `name`/`email`/`city` columns stay on `mix_leads`, informational-only going forward; application code reads from the joined `contacts` row.

**M8 — `mix_opportunities` FK cleanup**
```sql
alter table public.mix_opportunities add column company_id uuid references public.organizations(id);
```
Nullable, no backfill (no source data). `contact_id` and `lender_id` already exist.

**M9 — `construction_projects` table**
```sql
create table public.construction_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  organization_id uuid references public.organizations(id),
  name text not null,
  city text,
  province text default 'BC',
  project_type text,
  construction_stage text,
  estimated_value numeric(18,2),
  score int check (score between 0 and 100),
  source_url text,
  source_record_id text,
  raw_source_payload jsonb,
  source_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, source_record_id)
);

alter table public.construction_projects enable row level security;

create policy workspace_isolation on public.construction_projects
  for all
  using (workspace_id = current_workspace_id())
  with check (workspace_id = current_workspace_id());
```

**M10 — `mix_opportunities.construction_project_id`**
```sql
alter table public.mix_opportunities
  add column construction_project_id uuid references public.construction_projects(id);
```
`mix_opportunities.type` is plain `text`, no CHECK constraint — `'commercial_construction_financing'` is an application-level convention (documented in the Zod schema), no DDL needed.

## Shared Supabase client + Zod + Server Action surface

- **`src/lib/supabase/server.ts`** — `createRlsClient()` (anon key + Clerk session bearer token, RLS-bound, used by Server Actions) and `createServiceRoleClient()` (service-role key, bypasses RLS, used only by the ingestion script).
- **`src/lib/construction-projects/schema.ts`** — `ConstructionProjectInsertSchema` (Zod), shared by the Server Action and the ingestion mapper so both reject the same malformed input.
- **`src/lib/construction-projects/actions.ts`** — `"use server"`, minimal `createConstructionProject(input)`: Zod-validate, insert via `createRlsClient()`. Forward-compatible with the deferred command-center UI; not called by the ingestion script.

## BuildData API client

Sample-first, so nothing is written against an unverified response shape:

- **`scripts/builddata-sample.ts`** — Step 0, run manually once a real key exists. Calls one real endpoint (`GET /property` for one city, or `/coverage`) with the real `X-API-Key`, dumps raw JSON to a gitignored local file (`scripts/.builddata-samples/`). Nothing downstream is written until this has run.
- **`src/lib/builddata/client.ts`** — fetch wrapper, base URL `https://api.builddata.ca`, `X-API-Key` from `process.env.BUILDATA_API_KEY` (server-only, never `NEXT_PUBLIC_*`), throws on non-2xx.
- **`src/lib/builddata/rate-limit.ts`** — plain in-process counter (`DAILY_LIMIT = 100`) + fixed delay between calls. No queue/cron library — appropriate given 100 req/day, single manual invocation, pilot stage. Does not persist across process runs (operator discipline, not infra); each run logs its request count into `mix_agent_runs.metadata`.
- **`src/lib/builddata/types.ts`** — raw response types, explicitly commented `UNVERIFIED` until confirmed against a real sample.
- **`src/lib/builddata/map.ts`** — written only after `builddata-sample.ts` produces a real sample. Pure function: raw BuildData record → `ConstructionProjectInsertSchema`-shaped object.
- **`src/lib/builddata/municipalities.ts`** — Metro Vancouver + Fraser Valley allowlist, resolved by calling `GET /{dataset}/coverage` during the Step-0 sample call and intersecting against the known municipality set (not guessed).

## How the job runs

`scripts/ingest-builddata.ts`, manual invocation via `npm run ingest:builddata`. For each allowlisted municipality: call BuildData (respecting the rate limiter), map + Zod-validate each record, upsert into `construction_projects` via `createServiceRoleClient()` (dedup on `(workspace_id, source_record_id)`), log one `mix_agent_runs` row per invocation. No cron/scheduling — promoting to scheduled is a separate, later follow-up once there's an actual operational cadence to automate.

## Test plan

- `tests/helpers/local-stack.ts` — ported as-is from the `feature/clerk-orgs-rls-crud` worktree (schema-agnostic).
- `tests/helpers/fake-session.ts` — ported, dropping the hardcoded `db: { schema: "konstruction" }` (everything here lives in `public`).
- `tests/rls/mix-tenant-isolation.test.ts` — two fake JWTs, different `org_id` claims, confirm workspace A can't read/write workspace B's rows, looped across all 9 `mix_*` tables.
- `tests/rls/construction-projects-tenant-isolation.test.ts` — same pattern for the new table, including confirming `mix_opportunities.construction_project_id` doesn't leak cross-workspace via a join.
- Backfill correctness (the real 4+16 rows) is **not** a Vitest case — verified once manually via the M4 read-only SQL checks against real remote data; a fresh local reset starts empty so there's nothing to reproduce locally.
- `src/lib/builddata/map.test.ts` — fixture-based (provisional until the real sample exists): missing optional fields, city-name normalization, non-allowlisted municipality filtered out, malformed record fails Zod validation without crashing the batch (logged + skipped), duplicate records don't produce duplicate rows.
- `src/lib/builddata/rate-limit.test.ts` — stops at the cap within one run; delay is actually awaited (mock timers).

## Files to create/modify

| File | Purpose |
|---|---|
| `supabase/migrations/2026101712xxxx_*.sql` (×10, M1–M10) | Phase 0 tenancy + FK cleanup + Phase 1 schema |
| `src/lib/supabase/server.ts` | `createRlsClient()` / `createServiceRoleClient()` |
| `src/lib/construction-projects/schema.ts` | Zod schema shared by Server Action + ingestion mapper |
| `src/lib/construction-projects/actions.ts` | `createConstructionProject` Server Action |
| `src/lib/builddata/client.ts` | Fetch wrapper |
| `src/lib/builddata/rate-limit.ts` | In-process counter + delay |
| `src/lib/builddata/types.ts` | Provisional raw response types |
| `src/lib/builddata/map.ts` | Raw response → schema-shaped object (written after sample capture) |
| `src/lib/builddata/municipalities.ts` | Metro Van + Fraser Valley allowlist |
| `scripts/builddata-sample.ts` | Step 0 — one real call, dump raw JSON |
| `scripts/ingest-builddata.ts` | The ingestion job |
| `tests/helpers/local-stack.ts`, `tests/helpers/fake-session.ts` | Ported harness |
| `tests/rls/mix-tenant-isolation.test.ts`, `tests/rls/construction-projects-tenant-isolation.test.ts` | Tenant isolation coverage |
| `src/lib/builddata/map.test.ts`, `src/lib/builddata/rate-limit.test.ts` | Mapping + rate-limit edge cases |
| `package.json` | add `zod`, `vitest`, `tsx`, `jsonwebtoken`, `@types/jsonwebtoken`, `dotenv`; add `test`, `ingest:builddata`, `builddata:sample` scripts |
| `.env.example` | add `SUPABASE_SERVICE_ROLE_KEY=`, `BUILDATA_API_KEY=` |
| `.gitignore` | add `/scripts/.builddata-samples/` |

## Non-goals for this slice

- No command-center/dashboard UI for `construction_projects`.
- No broker-facing landing-page pilot-signup capture.
- No cron/queue/retry infrastructure.
- No BC coverage beyond Metro Vancouver + Fraser Valley municipalities.
- No `konstruction` schema drop (held for a separate, later explicit go-ahead).
- No Clerk middleware/provider wiring into the app shell.
- No Phase 2 (auto-bridging into era-1 `leads`/`opportunities` scoring) or Phase 3 (ClearClose Desk underwriting).
