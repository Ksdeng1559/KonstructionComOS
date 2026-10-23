# LeadSniperAI — Multi-Directory Business Sourcing (Proposed PRD Addendum)
Updated: 2026-10-21
Status: Planned; connectors and usage rights not yet implemented or approved.

## Goal
Source and qualify Canadian owner-operated and SME businesses for direct commercial and business financing conversations. These are business discovery inputs, not proofs of funding demand.

## Directory sources and implementation priority
1. **Google Business Profiles / Google Places API (New)**: geographic/category discovery and provider place ID; respect Places attribution, storage and caching restrictions; the Business Profile API is not a general third-party search API.
2. **Yelp Fusion API**: category/geography business search and business lookups. Evaluate API eligibility, rate limits, commercial use, caching, attribution and redistribution rights before ingestion. Yelp reviews and ratings are weak signals, not proof of financing demand.
3. **Yellow Pages Canada**: supplementary industry/category coverage and manual research; DO NOT build scraping or automated bulk harvesting. Yellow Pages prohibits scraping, data mining, automated searches and compiling competitive listing products under published terms. Seek explicit commercial data license or authorized provider feed before ingestion or resale.
4. **Direct company websites, public announcements, provincial registries, industry data providers**: primary means of independently verifying business and growth signals; store only where lawfully sourced and licensed.

## Source adapter contract
Each adapter declares: provider, method (API/manual/licensed feed), approved use, retention period, attribution rules, allowed stored fields, resale permission, quotas, source URL/record ID, access timestamp and expiry. Block activation without documented legal/product approval.

## Pipeline
1. Select geography (BC pilot: Metro Vancouver and Fraser Valley), industry and owner-oriented ICP.
2. Source candidate directory listings using permitted workflows.
3. Normalize and match entities using independently permissible company name, address, website/domain, phone, province and corporate registry identifiers; preserve provider-native IDs where allowed.
4. Dedupe branches vs parent companies; maintain multiple locations per company and provenance for each assertion.
5. Research company-owned site, hiring, announcements, expansions, new facilities, equipment investment, acquisitions, contracts, receivables and real estate signals. Record signal date and evidence URL.
6. Enrich decision-makers using lawfully available business contact data, verify owner/decision authority and record outreach permission.
7. Score **prospect research priority**, not creditworthiness or likelihood of loan approval. Candidate scoring weights: verified growth/capital signal 30; business fit 20; owner verification 15; product relevance 15; evidence quality/freshness 10; broker fit 10.
8. Human-review before outreach or broker routing. Financing need status defaults to UNKNOWN until owner/authorized representative confirms timing, use of funds and interest.
9. Route matched opportunities to an authorized broker; track owner conversation, financing products, appointment, mandate and outcome with full audit trail.

## Proposed record fields
company_id; legal_name; operating_name; website; industry; region; locations[]; source_references[] (source, provider_id, url, observed_at, usage_rights); source_license_status; entity_match_confidence; verification_status; expansion_signals[] (event, date, independent_evidence_url, confidence); decision_makers[] (role, business_contact, verification_date, consent_basis); financing_products[]; financing_need_status (unknown, owner_confirmed, not_interested); broker_mandate_fit; next_action; do_not_contact; retention_expiry.

## UI
LeadSniperAI sourcing settings: toggle approved adapters, region/industry, search budget, provenance and refresh cadence. Company Intelligence Card: sources, independently verified trigger, known vs inferred facts, owner, prospective product, follow-up and qualification stage. Chief of Staff brief: new verified expansion signals, overdue follow-ups, highest research priority companies.

## First pilot
Three industries: manufacturing, transportation/logistics and construction trades. Test Google and Yelp via permitted API workflows, plus licensed Yellow Pages if accessible. Pilot targets (not forecasts): 300 sourced, 100 researched, 50 owner contacts verified, 20 conversations, 5 owner-confirmed financing needs. Measure cost per verified and qualified company, source yield, duplicate rate, accuracy and appointment outcomes by directory.

## Compliance / safeguards
- No site scraping or bulk directory replication against terms; no resale of directory-derived data without explicit rights.
- Google Places generally restricts storing/caching API content; place IDs are an exception. Respect display attributions.
- Validate Yelp agreement for the exact commercial lead intelligence and resale use before any automated ingest.
- Comply with CASL, applicable telemarketing rules and privacy laws; separate owner consent/engagement evidence from data-source permissibility.
- Do not infer debt distress or creditworthiness from review patterns or other proxies.
- Track each claim's source and recency. Never label directory listings as qualified financing leads.

## Acceptance criteria
Document source rights; activate at least one compliant directory adapter; show end-to-end dedupe, provenance, enrichment, owner verification and qualification workflow; block unknown funding need from being represented as confirmed.


## Commercial real estate finance origination extension (2026-10-21)

Expand sourcing beyond SME operating companies to commercial property owners, developers and corporate borrowers. Two separate workstreams share a company master but not a single ambiguous opportunity record:
- **Business finance**: equipment, operating liquidity, receivables/inventory, acquisitions, working capital.
- **Commercial property finance**: purchase, refinance, land, construction, bridge, repositioning, owner-occupied and income property.

Additional approved sources: municipal zoning and development-permit portals, public land/project announcements, ParcelMap BC for parcel matching, BC Registry/OrgBook for entity matching, selective LTSA title searches for registered owner verification, and appropriately licensed BC Assessment property details. An automated feed or resale permission must be assessed source by source; a public website is not blanket permission to crawl or resell.

**Required distinction:** Operating business ≠ legal corporation ≠ property owner ≠ beneficial owner ≠ developer ≠ borrower. Model links and source-backed roles, not assumed identities.

**Broker discovery qualification:** asset and geographic mandate fit, identified sponsor/authorized principal, observed event and event date, project/property stage, current financing *unknown unless documented*, estimated loan amount *unknown unless supported*, follow-up and explicit borrower confirmation. Keep financing score as *research priority*, not borrowing intent or loan eligibility.

**MVP UI:** two filters (“Business Financing” and “Commercial Property Financing”), one company-centric relationship view, linked property/project tabs, evidence chronology, owner/decision-maker verification, and a broker review/Chief of Staff follow-up queue. Include refinance and development opportunities without assuming maturity dates or property equity from public records.

**Acceptance criteria:** at least one traceable prospect from each track; source URL/date and rights for every material assertion; no titled owner guessed from occupancy; no unconfirmed demand presented as qualified; separate outcome metrics for commercial mortgages and business loans.
