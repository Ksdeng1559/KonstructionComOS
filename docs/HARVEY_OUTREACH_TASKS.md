# Harvey outreach implementation backlog for Claude Code

- [ ] M0 inventory existing Harvey Outbox/Writer/Handler/discovery interfaces; identify direct API vs queued worker integration; update docs with concrete module names.
- [ ] M1 connect approved account/opportunity export to Harvey via idempotent, tenant-scoped JSON envelope and evidence URL references.
- [ ] M2 build read-only prospect/cohort discovery UI linked to DataForSEO and existing Harvey signals.
- [ ] M3 build draft creation, compliance evidence, rejection/edit workflow and explicit message-approval UI in KonstructionComOS.
- [ ] M4 build outbound dispatch *only after* two independent gates: (1) CASL/legal/commercial eligibility and suppression, (2) human review; append audit events.
- [ ] M5 connect reply classification, human-reviewed follow-up suggestions, calendar confirmation and source-attributed outcomes; test duplicate webhooks.
- [ ] Security and CI: organization RLS denial tests, sender replay prevention, branch/worker pin check, rate/budget ceilings, no secrets in logs.
- [ ] Pilot: internal seed inbox tests first; do not claim real outreach until opted in and evidence-backed.

All new integrations must respect the documented Mortgage Mix migration and existing tenant security. Do not write to live Supabase tables without approved, tested targeted migrations. No automatic prospect contact in the baseline.
