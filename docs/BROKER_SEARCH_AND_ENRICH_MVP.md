# Broker Search & Enrich — Dashboard MVP (2026-10-21)

## Broker feedback and product decision
Commercial financing brokers may already have a target company in mind. The first interaction should therefore be an **on-demand business search bar**, not only an automatically ranked lead feed. The broker searches by business name or website, chooses the exact business, and selectively requests more intelligence. This complements background LeadSniperAI sourcing rather than replacing it.

## Minimal user journey
1. Dashboard call-to-action: **Search & Enrich a Business**.
2. Enter business name, optional website/domain and territory; return compact company candidates.
3. Broker selects the correct operating company or branch; no enrichment before match confirmation.
4. Broker chooses what to research: decision-maker and title; expansion signals; commercial property/ownership; possible business/commercial real estate finance products.
5. Production design: estimate API/agent cost, confirm request, run server-side job, show provenance and progress (not fabricated success).
6. Display a reusable business intelligence card: company summary, people/roles with sources, independently supported signals, property title verification separately, product hypotheses, actual financing interest status (UNKNOWN by default), next permitted action.
7. Broker can explicitly add the verified record to their tenant-isolated pipeline or request a follow-up; deduplicate without storing provider-restricted data.

## Search modes for later iteration
- By company name (default), website/domain, official BC legal business identifier, or property address.
- Fuzzy matching and duplicate resolution by official entity identifiers, domain and normalized address; link branches and title-holding SPVs.
- Research only selected, permitted pages. Name-only search must not trigger indiscriminate bulk collection.

## Prototype delivered
`src/app/business-search/page.tsx` is a client-side UI with three **fictional records**, match selection, enrichment category checkboxes and a labeled preview state. `src/app/page.tsx` links to the screen from the existing dashboard. It does NOT invoke live APIs, charge money, start jobs, persist records, or claim real research results.

## Server-side implementation plan
- `POST /api/business-search` authenticated, rate-limited, tenant-aware; adapter broker search by name/domain, licensed source approval, return transient candidate IDs/source attribution.
- `POST /api/enrichments` idempotent scoped request on a confirmed candidate; requires authenticated workspace membership, provider license gates, consent/rights evaluation, cost cap, audit logs and a human approval threshold.
- Job runner (Railway worker or equivalent) executes TinyFish / approved company site extraction and independent enrichment; never use source-unauthorized scrapers.
- Supabase workspace-isolated research jobs, business master, provenance and cards with retention limits and RLS; merge into existing schema only after migrations and tenancy design review.
- Public company leads and source-backed people data require privacy/CASL analysis before contact or brokerage distribution.
- No automated credit decision, no fabricated equity, mortgage maturity, property ownership or financing interest.

## Acceptance tests
- Search and match work on phone and desktop.
- Typing does not accidentally create paid research jobs.
- Enrichment categories stay optional.
- No results/no selection states visible.
- Source link/date visible per card assertion when wired.
- Tenant A cannot read Tenant B's query or cards.
- Actual need unconfirmed until borrower confirmation.
- Source/provider failure should not be reported as successful research.

## Success metrics
Search-to-correct-match, selection-to-enrichment request, researched contacts verified, broker time saved, cost per card, broker-accepted conversations and financing mandates.
