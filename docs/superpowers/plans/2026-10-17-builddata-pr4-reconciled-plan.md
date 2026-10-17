# BuildData → KonstructionComOS project intelligence — reconciled implementation plan

Date: 2026-10-17
Status: specification; nothing applied to `amgknqnhiscryvcfeoyj` or any branch yet.
Replaces: `docs/superpowers/plans/2026-10-17-builddata-mortgage-mix-ingestion-plan.md` (superseded same day — written without knowledge of PR #4).
Authoritative target architecture: `docs/BUILDDATA_INTEGRATION.md` (PR #4, `feature/builddata-integration-spec`).

## 0. The foundational decision

PR #4's own instruction — "use existing project/stakeholder/opportunity tables where practical... do not build a parallel competing registry," plus "each client sees only permitted *shared* project data and their own notes/leads/engagements" — implies `construction_projects` and its supporting intelligence-core tables are a **single shared registry across tenants**, not workspace-scoped copies. The tenant boundary lives one layer up, at the opportunity/interaction layer (`mix_opportunities`). This is the single biggest deviation from the superseded plan, and it's what makes "one construction signal → many tenant-side financing opportunities" (confirmed earlier) trivially true instead of requiring duplicated rows per tenant.

Direct consequence: PR #4's `tenant_project_opportunities` bullet is **not** a new table — it's `mix_opportunities`, extended. It already has the right cardinality via `construction_project_id`, already gets `workspace_id` from Phase 0, and the approved Mortgage Mix spec already put `construction_project_id` on it.

## 1. PR #4's 10 proposed tables, mapped

| PR #4 bullet | Call | Why |
|---|---|---|
| `provider_sources` | New | Per-record immutable provenance; one parcel can carry multiple distinct permits — no existing table expresses this. |
| `source_coverage` | New | No analog; small, platform-level. |
| `sites` + `project_site_links` | New, many-to-many | `organizations.location` is company-level, not parcel-level. Cardinality is a judgment call (§9). |
| `project_events` | New | No analog; stage history is derived from this ordered by `occurred_at`, not a separate 13th table. |
| `project_organizations` | New, replaces `construction_projects.organization_id` | `organizations` stays the company master; this adds many-roles-per-project (owner/developer/contractor/architect/applicant), each sourced and confidence-scored. |
| `enrichment_claims` | New, **deferred** (§6) | No analog; not built this slice. |
| `client_brain_profiles` | New, **deferred** (§6) | Collides with PR #7's own Client Brain — not resolved here. |
| `opportunity_scores` | New, **deferred** (§6) | Not built this slice. |
| `tenant_project_opportunities` | **Collapses into `mix_opportunities`, extended** | See §0. |
| `ingestion_runs` / `ingestion_checkpoints` | New, not reused from `mix_agent_runs` | `mix_agent_runs` is Era-2 campaign/AI-agent-run logging, a different domain — assumption flagged in §9, worth a live check before finalizing. |

`construction_projects` is reshaped: drops `organization_id` (→ `project_organizations`), `score` (→ future `opportunity_scores`), `raw_source_payload`/`source_record_id`/`source_url`/`source_seen_at` (→ `provider_sources` + `project_events`, since a project can now have >1 source), and `workspace_id` (shared, per §0).

## 2. Migration sequence

### Phase 0 — Mortgage Mix tenancy + FK cleanup (carried forward unchanged)

**M1 — `workspaces.clerk_org_id`**
```sql
alter table public.workspaces add column clerk_org_id text unique;
```

**M2 — `current_workspace_id()`, must be `security definer`**
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
`workspaces` already has an unrelated Era-3 RIOS policy (`id = rios_workspace_id()`, Supabase-native `auth.uid()`) — a non-definer function would silently return `NULL` for every Clerk-authenticated caller, fail-closing every new policy. Do not touch/reuse `rios_workspace_id()`.

**M3 — `workspace_id` (nullable) on the 9 `mix_*` tables**: `mix_leads`, `mix_opportunities`, `mix_campaigns`, `mix_campaign_sends`, `mix_conversations`, `mix_relationship_scores`, `mix_agent_runs`, `mix_knowledge_assets`, `mix_outreach_messages`.

**M4 — seed default workspace + backfill real rows**
```sql
insert into public.workspaces (name, slug, vertical, onboarding_status)
values ('Eng & Associates', 'eng-associates', 'mortgage_mix', 'legacy_skip')
on conflict (slug) do nothing;
-- then: update <each of the 9 tables> set workspace_id = (select id from workspaces where slug='eng-associates') where workspace_id is null;
```
Verify manually against remote (fresh local reset starts empty, nothing to reproduce locally): `mix_leads` expect 4 rows backfilled, `mix_opportunities` expect 16, zero NULLs after.

**M5 — `NOT NULL`** on all 9, only after M4 verification.

**M6 — RLS**, one `FOR ALL` policy per table: `workspace_id = current_workspace_id()` for using/with check. Coexists with existing service-role-bypass policies. This also fixes `mix_conversations`/`mix_relationship_scores` (currently RLS-enabled-zero-policies).

**M7 — `mix_leads` FK cleanup**: add `contact_id`, `company_id`; backfill `contact_id` by upserting a `contacts` row from inline `name`/`email`/`city`; leave `company_id` null (no source data); inline columns stay, informational-only.

**M8 — `mix_opportunities` FK cleanup**: add `company_id`, nullable, no backfill.

### Phase 1 — PR #4 intelligence core (replaces superseded plan's construction_projects design)

**M9 — `construction_projects`** (shared, not workspace-scoped; service-role write only)
```sql
create table public.construction_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  province text default 'BC',
  project_type text,
  current_stage text,
  estimated_value numeric(18,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.construction_projects enable row level security;
create policy authenticated_read on public.construction_projects for select using (auth.role() = 'authenticated');
```

**M10 — `provider_sources`**
```sql
create table public.provider_sources (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'builddata',
  dataset text not null,
  source_record_id text not null,
  municipality text,
  raw_payload jsonb not null,
  raw_hash text not null,
  collection_time timestamptz not null default now(),
  publisher_source_url text,
  attribution text,
  licence text,
  transformation_version int not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (provider, dataset, source_record_id)
);
alter table public.provider_sources enable row level security;
create policy authenticated_read on public.provider_sources for select using (auth.role() = 'authenticated');
```

**M11 — `source_coverage`**
```sql
create table public.source_coverage (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'builddata',
  dataset text not null,
  municipality text not null,
  is_covered boolean not null,
  record_count int,
  last_checked_at timestamptz not null default now(),
  notes text,
  unique (provider, dataset, municipality)
);
alter table public.source_coverage enable row level security;
create policy authenticated_read on public.source_coverage for select using (auth.role() = 'authenticated');
```

**M12 — `sites`**
```sql
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  address text, city text, province text default 'BC',
  parcel_id text, latitude numeric(9,6), longitude numeric(9,6),
  geocode_precision text,
  created_at timestamptz not null default now()
);
alter table public.sites enable row level security;
create policy authenticated_read on public.sites for select using (auth.role() = 'authenticated');
```

**M13 — `project_site_links`** (depends on M9, M12)
```sql
create table public.project_site_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.construction_projects(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  relationship text not null default 'primary',
  created_at timestamptz not null default now(),
  unique (project_id, site_id)
);
alter table public.project_site_links enable row level security;
create policy authenticated_read on public.project_site_links for select using (auth.role() = 'authenticated');
```

**M14 — `project_events`** (depends on M9, M10)
```sql
create table public.project_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.construction_projects(id) on delete cascade,
  provider_source_id uuid not null references public.provider_sources(id),
  event_type text not null,
  stage_label text,
  occurred_at timestamptz,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index project_events_project_idx on public.project_events(project_id, occurred_at desc);
alter table public.project_events enable row level security;
create policy authenticated_read on public.project_events for select using (auth.role() = 'authenticated');
```

**M15 — `project_organizations`** (depends on M9, `organizations`, M10)
```sql
create table public.project_organizations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.construction_projects(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  role text not null,
  provider_source_id uuid references public.provider_sources(id),
  confidence text,
  effective_from date, effective_to date,
  created_at timestamptz not null default now(),
  unique (project_id, organization_id, role, provider_source_id)
);
alter table public.project_organizations enable row level security;
create policy authenticated_read on public.project_organizations for select using (auth.role() = 'authenticated');
```

**M16 — `ingestion_runs`** (platform-level, no RLS needed — service-role tooling only)
```sql
create table public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'builddata',
  dataset text not null, municipality text,
  started_at timestamptz not null default now(), finished_at timestamptz,
  status text not null default 'running',
  records_fetched int not null default 0, records_upserted int not null default 0, records_skipped int not null default 0,
  error_count int not null default 0, error_detail jsonb,
  requests_used int not null default 0, quota_remaining int,
  created_at timestamptz not null default now()
);
```

**M17 — `ingestion_checkpoints`** (depends on M16)
```sql
create table public.ingestion_checkpoints (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'builddata',
  dataset text not null, municipality text not null,
  cursor text, last_record_update_value timestamptz,
  last_run_id uuid references public.ingestion_runs(id),
  updated_at timestamptz not null default now(),
  unique (provider, dataset, municipality)
);
```

**M18 — `mix_opportunities` intelligence-core extension**
```sql
alter table public.mix_opportunities
  add column construction_project_id uuid references public.construction_projects(id),
  add column commercial_need_state text not null default 'unknown'
    check (commercial_need_state in ('unknown', 'hypothesized', 'confirmed')),
  add column commercial_need_evidence jsonb,
  add column commercial_need_reviewer text,
  add column commercial_need_set_at timestamptz;
```
`commercial_need_state` defaults to `'unknown'` — implements PR #4's "financing need defaults to unknown... scoring must not silently promote hypotheses to confirmed" as a standing data-integrity invariant, independent of the (deferred) scoring algorithm.

Migration files: M1–M8 as `supabase/migrations/2026101712xx_*.sql`, M9–M18 as `supabase/migrations/2026101713xx_*.sql`, applied via Supabase MCP `apply_migration` in this exact order.

## 3. Branch topology — do not merge PR #4's branch

PR #4 is based on PR #1 (`feature/mock-dashboard`), not `main`. Merging it would drag in unreviewed PR #1 commits. Port only the actual files:
```bash
git fetch origin feature/builddata-integration-spec
git log origin/feature/builddata-integration-spec --oneline -- docs/BUILDDATA_INTEGRATION.md CLAUDE.md .env.example
git checkout -b docs/port-builddata-integration-spec main
git show <sha> -- docs/BUILDDATA_INTEGRATION.md CLAUDE.md .env.example | git apply
git add docs/BUILDDATA_INTEGRATION.md CLAUDE.md .env.example
git commit -m "docs: port BuildData integration spec from PR #4 onto main"
```
Lands on `main` before the migrations in §2 — CLAUDE.md's new instruction and `.env.example`'s key placeholder are both referenced by §5.

## 4. Env var fix

Adopt PR #4's spelling: **`BUILDDATA_API_KEY`** (double-D). The superseded plan's `BUILDATA_API_KEY` was a typo — corrected everywhere below.

## 5. Provider client design

Still sample-first. Broadened: 4 P0 datasets, not 1; auth mechanism unverified.

- **`scripts/builddata-sample.ts`** — Step 0. Hits live `https://www.builddata.ca/openapi.json` first to confirm the actual security scheme (don't hardcode `X-API-Key` without checking), then `/coverage` + one P0 dataset for one pilot municipality. Dumps raw JSON to gitignored `scripts/.builddata-samples/`.
- **`src/lib/builddata/client.ts`** — fetch wrapper, server-only base URL/key, auth header from the Step 0 sample, typed responses, timeout, typed errors carrying HTTP status.
- **`src/lib/builddata/coverage.ts`** — calls each P0 dataset's `/coverage`, upserts `source_coverage`. A municipality is ingestion-eligible only if present and `is_covered = true` in a fresh check.
- **`src/lib/builddata/rate-limit.ts`** — in-process counter + fixed delay, plus reads today's `sum(requests_used)` from `ingestion_runs` before starting (persisted quota tracking across runs).
- **`src/lib/builddata/retry.ts`** — exponential backoff with jitter, honors `Retry-After` on 429. Per-status handling: 400/422 skip no retry; 403 marked *restricted* not *absent* (free-tier 30-day lag ≠ nonexistence); 404 skip; 429 backoff+retry; 500/504 retry with capped attempts then mark run `'failed'`.
- **`src/lib/builddata/types.ts`** — raw response types per dataset, each commented `UNVERIFIED` until confirmed.
- **`src/lib/builddata/map.ts`** — written only after real samples for all 4 P0 datasets exist. One pure function per dataset. Dedup rule this slice: each distinct `(dataset, source_record_id)` gets its own `construction_projects` row — cross-dataset/address merging is deferred to a later human-reviewed linking workflow.
- **`src/lib/builddata/upsert.ts`** — idempotent upsert keyed on `(provider, dataset, source_record_id)`: unchanged `raw_hash` → bump `last_seen_at` only; changed → update + insert new `project_events` row (history preserved, never mutated in place).
- **`src/lib/builddata/municipalities.ts`** — allowlist resolved from `source_coverage`, starts as one measured pilot municipality.

`scripts/ingest-builddata.ts`: for the pilot municipality × each P0 dataset → coverage check → rate-limited fetch+retry → map → upsert via service-role client → one `ingestion_runs` row + checkpoint per (dataset, municipality) per invocation.

## 6. Deferred: GTM scoring and Client Brain

`opportunity_scores`, `client_brain_profiles`, `enrichment_claims` are **not built this slice**:
1. PR #4's own step 0 gates "tenant-owned interactions" (scores/profiles qualify) behind the Clerk/RLS security gate — building them first would violate PR #4's own sequencing.
2. **PR #4 vs PR #7 collision, unresolved**: PR #7 (separate branch) already defines its own Client Brain — a 5-step broker interview with draft/versioned activation and a different field set (purpose/property/province/amount weights) than PR #4's Client Brain contract (territory/specialty/capacity/KPI targets). Building `client_brain_profiles` under either spec now risks being wrong twice. Needs explicit reconciliation between the two PRs before any DDL here.

Shipped despite the deferral: `commercial_need_state` + evidence/reviewer/timestamp columns on `mix_opportunities` (M18) — a data-integrity invariant, not a scoring algorithm.

## 7. Test plan

Harness: port `tests/helpers/local-stack.ts` as-is; `tests/helpers/fake-session.ts` retargeted from `db:{schema:"konstruction"}` to `public`.

- `tests/rls/mix-tenant-isolation.test.ts` — unchanged: two fake JWTs, different `org_id`, isolation across all 9 `mix_*` tables.
- `tests/rls/mix-opportunities-shared-project-join.test.ts` — two workspaces' `mix_opportunities` both point at the *same* `construction_project_id`; each sees only its own opportunity row, both can read the shared core.
- `tests/rls/shared-core-authenticated-read.test.ts` — any authenticated fake JWT (any `org_id`) reads the 7 shared-core tables; none can write (service_role only).
- `tests/rls/shared-core-no-anon-access.test.ts` — no bearer token → zero rows from any shared-core table.
- `src/lib/builddata/map.test.ts` — per-P0-dataset fixtures: missing optional fields, municipality normalization, non-allowlisted municipality filtered, malformed record skipped not crashing the batch.
- `src/lib/builddata/coverage.test.ts` — persists `source_coverage`; municipality absent from response → ineligible, ingestion refused with a clear error.
- `src/lib/builddata/idempotency.test.ts` — re-run same fixtures → zero new rows (only `last_seen_at` bumps); changed `raw_hash` → exactly one new `project_events` row, no in-place history mutation.
- `src/lib/builddata/errors.test.ts` — mocked 400/403/404/422/429/500/504 drive the correct branch per §5; `Retry-After` honored; jitter asserted as a tolerance range with mock timers.
- `src/lib/builddata/rate-limit.test.ts` — stops at daily cap; consults persisted `ingestion_runs.requests_used` sum before starting.

Backfill correctness (real 4+16 rows) verified manually via read-only SQL against remote post-M4, not a Vitest case.

## 8. Files, env vars, non-goals

Files: migrations (×18), ported PR #4 docs/CLAUDE.md/.env.example onto `main`, `src/lib/supabase/server.ts`, `src/lib/builddata/{client,retry,rate-limit,coverage,municipalities,types,map,upsert}.ts`, `scripts/builddata-sample.ts`, `scripts/ingest-builddata.ts`, `src/lib/construction-projects/schema.ts`, ported test harness, 4 RLS tests + 4 builddata unit tests, `package.json` deps/scripts, `.gitignore`.

Env vars: `SUPABASE_SECRET_KEY=` (already present in `.env.local`; matches this repo's actual naming convention, not a separately-named `SUPABASE_SERVICE_ROLE_KEY`), `BUILDDATA_API_KEY=`, `BUILDDATA_BASE_URL=https://api.builddata.ca` (confirmed live endpoint, not `www.builddata.ca` which is just the docs host).

Non-goals: command-center UI, `opportunity_scores`/`client_brain_profiles`/`enrichment_claims`, cross-dataset project linking, BC coverage beyond one pilot municipality, `konstruction` schema drop, Clerk app-shell wiring, cron/scheduler, resolving the PR #4/PR #7 Client Brain collision.

## 9. Explicitly flagged — not resolved, needs a human/live-check

- ~~BuildData auth mechanism~~ **Resolved 2026-10-17**: `X-API-Key` header (not `Authorization: Bearer`, despite BuildData's own MCP docs claiming both work — confirmed live, `Bearer` returns 403 "Missing API key", `X-API-Key` returns 200). Confirmed against `GET /permit/coverage`: 4,096,174 permits, 59 cities. Municipality slugs are lowercase/underscored (e.g. `vancouver`, `surrey`, `burnaby`, `coquitlam`, `delta`, `new_westminster`, `port_moody`, `langley_township`, `langley_city`, `white_rock`, `port_coquitlam`, `north_vancouver_city`, `north_vancouver_district`, `maple_ridge`, `mission`) — all of Metro Vancouver/Fraser Valley confirmed present in coverage, so the pilot-municipality allowlist in `src/lib/builddata/municipalities.ts` is unblocked.
- Pagination/cursor shape per dataset — may differ across datasets, unverified.
- Rate-limit header names / whether `Retry-After` is actually present — assumed by convention.
- `sites`/`project_site_links` cardinality — chosen as many-to-many by default; not prescribed by PR #4.
- `project_organizations` uniqueness — chosen to allow multiple corroborating rows per `(project, org, role)` across different sources; a judgment call.
- Whether PR #4's "permitted shared project data" means blanket-shared-read-for-all-authenticated-tenants (used throughout this plan) or a narrower permitted subset per tenant/territory — the simpler interpretation was used; may need revisiting with a real multi-broker pilot.
- `mix_agent_runs`'s actual live columns were not inspected before deciding to build separate `ingestion_runs`/`ingestion_checkpoints` tables instead of reusing it — worth a one-query check first.
- PR #4 vs PR #7 Client Brain collision (§6) — needs reconciliation before any `client_brain_profiles` DDL.
