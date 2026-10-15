# ClearConnect public frontend integration plan

## Approved frontend

- Published frontend: https://clearconnectcom.lovable.app/
- Source: Lovable project **ClearCommercialConnect** (project ID `136ade9c-5e7f-4aea-95d7-de34af9aabc0`).
- Editor: https://lovable.dev/projects/136ade9c-5e7f-4aea-95d7-de34af9aabc0
- Approved role: public customer acquisition, product education, project use-case demonstrations and demo/early-access lead generation for KonstructionComOS.
- Main product repository: https://github.com/Ksdeng1559/KonstructionComOS

## Actual source assessment

The Lovable source contains Vite, React 18, React Router, shadcn/ui, Tailwind 3 and Supabase integration files. Existing pages include `/`, `/product`, `/use-cases`, `/for-brokers`, `/coverage`, `/resources`, `/pricing`, `/request-demo`, `/privacy`, `/terms`, plus admin routes. Components include `OpportunityExplorer`, `UseCaseJourneys`, `CanadaMap` and `DemoForm`.

Source document `.lovable/construction-intelligence-architecture.md` confirms the opportunity workflow remains illustrative: **demo projects must not be silently persisted or sent to the CRM**. It also references existing managed auth, demo-request leads and Atomic CRM integration; do not bypass or replace existing live processing without testing.

The GitHub scaffold is a separate Next.js 15 / React 19 / Tailwind 4 application with synthetic sample rows and a basic Supabase schema. A published Lovable URL does not merge codebases, migrate auth, or connect backends.

## Recommended target topology

```text
https://clearconnectcom.lovable.app/ (current public website)
               │
       CTA: request demo / trial
               │
     CRM / lead-intake workflow (existing, verify)
               │
        CTA: launch SaaS
               ▼
https://app.<approved-domain>/ (future KonstructionComOS)
      Next.js + Clerk Organizations
               │
    Server-validated tenant context
               │
    Supabase Postgres (RLS + audit)
               │
    Project intelligence / underwriting CRM
```

The app hostname is a placeholder and must not be published before domain ownership and deployment are configured.

## User journeys to retain

1. Product and pricing discovery → Request Demo.
2. Explore illustrative BC project signals → read briefing → explicitly request demo/early access.
3. Broker use case → explore financing fit and capital hypotheses → authorized, human-reviewed follow-up.
4. Existing sign-in must be reviewed: `src/components/layout/Header.tsx` currently uses a hardcoded `https://urban-mining-crm.vercel.app/#/` link. Do **not** replace with a non-existent SaaS URL; coordinate migration and validate redirect/return paths.

## Integration work packages

### FE-01 — Brand and URL contract (P0)
- Adopt existing public typography, colors, page structure, CTA language and conversion flows.
- Confirm primary brand: displayed Lovable header currently says `Klick2Client`; product repository is `KonstructionComOS`. Agree whether architecture is white-label (Klick2Client distribution / KonstructionComOS SaaS) before rebranding.
- Record definitive domains for public marketing, SaaS app and API.

### FE-02 — SaaS authentication (P0)
- Implement Clerk Organization onboarding in Next.js app.
- Verify identity and org membership on server, map to internal org IDs and enforce Postgres RLS.
- Provide cross-tenant tests and logout/redirect handling.
- Connect public site sign-in and trial CTAs only after auth route and domain are live.

### FE-03 — Design-system alignment (P0)
- Catalog Lovable colors, spacing, typography, shadcn components and mobile navigation.
- Build equivalents within Next.js and Tailwind 4, preserving accessibility.
- Never copy Vite route configuration directly into Next.js App Router.
- Consider independently hosting both apps rather than attempting wholesale migration.

### FE-04 — Opportunity migration (P1)
- Port relevant `OpportunityExplorer` **presentation and calculations**, not unverified records.
- Replace fixture data with authorized project registry queries; display freshness, source URLs, verification state and score explanations.
- Keep demonstration and production record namespaces distinct.
- Add permissioned save-to-CRM and evidence capture with audit trail.

### FE-05 — Lead routing, subscriptions and analytics (P1)
- Audit current Lovable demo-form processing and any Atomic CRM connector before reimplementation.
- Route explicit demo requests to the existing authorized system; add idempotency and consent/suppression evidence.
- Add Stripe only after account and organization mapping is production-ready.
- Instrument qualified-signup conversion with no PII leakage.

## Acceptance criteria

- Public pages remain available at their existing URL with no lost forms, redirects or SEO metadata.
- SaaS launch CTA points to the deployed authenticated app and honors safe return paths.
- A user of organization A cannot read or mutate organization B resources.
- Demo data is always labeled as illustrative and never transmitted as live deal intelligence.
- Mobile and desktop layouts visually align with the approved Lovable design.
- Source provenance, privacy, contact eligibility and suppression are enforced for outreach.
- CI typecheck, build and integration tests pass; deployment URLs and external systems are verified, not inferred.

## Decision log

**2026-10-14:** User designated `https://clearconnectcom.lovable.app` as frontend for KonstructionComOS. Recommended initial implementation is a **connected public frontend + separate authenticated SaaS**, pending branding/domain confirmation and actual auth integration.

**2026-10-15:** Broker-console design prototype added ([`docs/design/BROKER_CONSOLE.md`](design/BROKER_CONSOLE.md)). It applies the Lovable color/type tokens (FE-03) to the authenticated app's first screens, adds a unified inbox planned on Unipile, and supersedes the visual design of PR #1 while keeping its engineering. Static prototype only — no integration built.
