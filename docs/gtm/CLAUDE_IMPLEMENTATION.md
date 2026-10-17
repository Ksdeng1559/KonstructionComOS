# Claude Code implementation handoff: GTM outreach

Read root AGENTS.md, CLAUDE.md, README.md and docs/gtm/OUTREACH_SYSTEM.md. Inspect actual code and current branch before implementation. The open GTM PR #2 and Mortgage Mix workstream are separate dependencies, not merged features.

## Task to continue

Extend the tested dry-run outreach planner into one source-independent broker workflow. Start with synthetic fixtures: one research-blocked prospect, one suppressed contact, one unapproved draft and one approved manual-action recommendation. Keep all data isolated from production and all sending/booking disabled.

### Slice 1 — mock review UI

Connect `planOutreach` to a mock Outreach panel without replacing the existing dashboard or the separate strategy-review engine. Show source/date, project, role, confirmed fit, offer, unknown financing need, contact basis, owner, draft version, approval scope and stop reasons. Implement explicit review/reject/revise controls; never show an enabled live Send action. Handle empty, blocked, stale and approval-expired states. Add accessible mobile/keyboard paths.

Done: reviewer can inspect evidence, revise a draft and observe old approval become invalid. No HTTP provider calls, browser secrets or real contact data.

### Slice 2 — authenticated persistence

First reconcile with the approved Mortgage Mix schema and named FKs. Reuse tasks/notes/touchpoints; add only necessary campaign/enrollment/draft/approval/action structures through reviewed additive migrations. Derive organization from verified Clerk identity. Enforce RLS, same-workspace FK constraints and durable uniqueness. Never modify the live shared Supabase project through this mock implementation.

Done: two-organization denial tests, invalid-reference tests, concurrent enrollment and retry tests, audit history, rollback verification and explicit retention/source-use controls pass.

### Slice 3 — reply and meeting workflow

Implement signed, idempotent event ingestion; positive/negative/opt-out/out-of-office classification with review for ambiguity. Any reply pauses pending touches. Qualification evidence and actual meeting attendance are separate from booked state. Propose slots only after checking availability; booking/cancellation writes need explicit authorization, collision checks and idempotency.

Done: duplicate or out-of-order webhooks cannot clear suppression, create duplicate meetings or fabricate attendance/qualification. No external delivery enabled yet.

### Slice 4 — optional provider execution

Before implementation, inspect the actual provider interfaces, licenses and deployed versions for LeadSniperAI, DataForSEO, Harvey and any sender/calendar service. Do not invent SDK methods. Document secrets, allowed tools, source rights, channel eligibility and authorization scope. Add a server worker/outbox, bounded retries, provider reconciliation and kill switch. Default all delivery flags off. A separate approved pilot campaign is required to exercise live writes.

Done: final-time eligibility recheck, content/evidence approval binding, suppression race tests, uncertain-acceptance recovery, signed events, per-campaign touch/cost caps and operator kill switch tested in a sandbox.

## Verification and reporting

Run `npm run test:gtm`, `npm run typecheck`, `npm run lint`, `npm run build` and meaningful slice-specific tests. Report actual failures or missing environment dependencies. Do not claim the pure planner implements authenticated tenancy, durable idempotency, legal eligibility, campaigns, providers or bookings. Update README status per completed slice; retain unknowns and proposed integrations explicitly.
