# Architecture and security boundaries

> Canonical intended division (2026-10-21): **WordPress at **https://www.commercialkonnect.ca** is the production public website**, **Lovable is prototyping only**, **Next.js is the authenticated SaaS application**. These are target responsibilities; publication and integration are not thereby verified.

## Layers
- **WordPress (https://www.commercialkonnect.ca):** public marketing, CMS, directory, SEO and financing education, consent-based financing intake, broker/demo CTAs. Production WordPress hosting and theme selection remain operational decisions. Keep CRM records in Supabase, not WordPress.
- **Next.js App Router + TypeScript + Tailwind/shadcn:** authenticated broker Mission Control, LeadSniperAI prospect and project review, verified intelligence cards, capital origination Kanban, client briefings and future OODA Chief of Staff.
- **Clerk Organizations:** user authentication, organization context and role checks for the app; do not assume WordPress and Clerk share login without an explicit secure integration.
- **Supabase Postgres:** canonical business and tenant records, RLS and audit logs. Resolve existing Mortgage Mix and separate Atomic CRM design before migrating.
- **Optional Railway workers:** scheduled permitted-source collection, research provider adapters, deduplication/verification and asynchronous agent jobs. **Vercel:** app hosting. **GitHub:** source, code review and CI/CD. **Slack:** support coordination, incident escalation and release approvals—not credentials or system of record.
- **Lovable:** design experiments and prototype UX; never considered a deployed/connected production component without separately tested migration.

## Tenant isolation
Every tenant-owned row must have a server-established organization/workspace identity. Validate the Clerk session and membership, map Clerk org to internal UUID and enforce Postgres RLS across all tables. Never trust user-supplied workspace IDs as authorization. Do not use service-role keys for ordinary browser requests. Test cross-tenant reads, exports, updates, webhook handlers and background jobs.

## Source pipeline
Licensed business listing APIs (e.g. Google Places/Business Profile as permitted) and government/project sources -> source snapshots and observed timestamps -> normalization -> company/project dedupe -> evidence/provenance -> human validation -> segment-specific prospect qualification -> approved action/pipeline. Business reviews/listings and permits must **not** be interpreted as confirmation of financing intent.

## Compliance and operational baseline
CASL and applicable privacy requirements, data minimization, consent versioning, suppressions/opt-outs, lender and financing claims human-reviewed. Respect source licenses. Encrypted transport, scoped API keys, safe secret stores, Sentry-style monitoring, budget/rate limits, idempotent imports, backups/restore, audit events, GitHub PR gates, staged releases and rollback. Record Canadian residency decisions before production data collection.

## Current product status
Next.js dashboard uses synthetic fixtures; production CRUD, Clerk JWT/RLS verification, billing, OODA Chief of Staff and multi-provider research remain unverified or planned in current docs. This document specifies target design, not implemented runtime.

See [Technical Implementation and Slack Operations](TECHNICAL_IMPLEMENTATION_AND_SLACK_OPS.md) for full contracts, runbooks, support SLAs, phases and acceptance gates.

## Public hostname and redirects
The designated canonical public URL is **https://www.commercialkonnect.ca**. Configure TLS for both apex and www, redirect **https://commercialkonnect.ca** to the canonical www HTTPS hostname with a permanent redirect, and use the canonical URL in the sitemap, canonical tags and WordPress home/siteurl settings. DNS, certificates and live redirect behaviour have not been verified by this documentation change.
