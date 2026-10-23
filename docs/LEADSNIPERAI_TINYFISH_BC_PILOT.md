# TinyFish BC Business Owner & Financing Signal Pilot

Date: 2026-10-21
Status: Live research proof of concept; NOT production lead qualification or outreach.

## Goal
Use TinyFish public web search and fetch to find BC businesses with independently documented expansion signals, named decision-makers, and plausible financing product conversations. Finance need remains UNKNOWN until authorized owner confirmation.

## Pilot findings

### Advanced Cyclotron Systems, Inc. (ACSI)
- Location: Surrey, BC; new facility at 19145 34A Avenue.
- Signal: 2026-05-14 trade article reports new 48,000 sq ft purpose-built manufacturing facility replacing existing 24,000 sq ft Richmond facility; designed for growth in cyclotron manufacturing, expected more than double production capacity.
- Identified leader: Richard Eppich, CEO, quoted in dated article. Role and identity should be checked against first-party/current sources before outreach.
- Possible financing discovery: industrial real estate/construction funding, specialized manufacturing equipment, working capital during expansion.
- Actual funding need: UNKNOWN. Do not claim financing is required or available.
- Source: https://www.connectcre.ca/stories/acsi-breaks-ground-on-new-purpose-built-manufacturing-site-in-surrey/

### Flagship Logistics
- Location: Delta, BC; company About page gives 1405 Cliveden Avenue, Annacis Island, 32,000 sq ft site.
- Signal: Company's 2026-04-01 expansion post says it moved from Richmond to a larger Annacis Island facility, with increased capacity.
- Owner: Company's blog identifies “Adis” as owner; full name and legal ownership not independently verified. Do not invent surname or corporate officer role.
- Possible discovery: material handling equipment, fleet, warehouse build-out, cash-flow capacity.
- Actual funding need: UNKNOWN.
- Sources: https://flagshiplogistics.ca/blog/flagship-logistics-expansion-new-facility/ and https://flagshiplogistics.ca/about/

### Additional companies from government grant announcement
- On 2026-07-13 PacifiCan described public investments and expansion/capex activities involving AI Industries ($1m), MTC Solutions ($630,250), Nanak Foods ($5.5m), and PowerHouse Building Solutions ($925k).
- These are research candidates, not established funding gaps. The government funding amounts must be factored into qualification, rather than interpreted as proof of unmet need.
- Source: https://www.canada.ca/en/pacific-economic-development/news/2026/07/backgrounder-government-of-canada-invests-over-8-million-to-help-surrey-businesses-boost-productivity-and-reach-new-markets.html

## TinyFish procedure
1. Search by BC city + industry + concrete growth event: new facility, warehouse, equipment, production, contract, expansion. Prefer fresh dated first-party and official government records.
2. Fetch primary pages with TinyFish; record canonical URL, page title, article date, observed timestamp.
3. Extract structured business signals with evidence text, not just generic AI explanations; distinguish announced/planned vs completed.
4. Read first-party About/Leadership page to verify named principal/title. Mark unidentified leaders as unverified.
5. Identify exact business entity via OrgBook/BC Registry when required. For property ownership, rely on PID + LTSA title (not inference from occupancy).
6. Infer relevant discussion topics only; do not infer creditworthiness, indebtedness or loan intent.
7. Preserve privacy and data rights; authorized contact and CASL assessment before outreach.
8. Broker human review and owner confirmation are required to move from research-qualified to financing-qualified.

## Business Intelligence Card Schema (proposed)
- business_name, website, city, industry, legal_entity_status
- contact_name, role, verification_level, role_source_url, role_as_of
- signals[]: category, event_date, evidence_url, evidence_summary, state(planned/announced/underway/completed)
- possible_products[], existing_public_funding[], needs_confirmed(false by default)
- property_address, PID (when verified), title_ownership_status (unknown by default)
- source_rights, last_verified, follow_up, broker_id, contact_permission_status

## Implementation
Add TinyFish as an *optional server-side enrichment provider* rather than replacing directory discovery adapters. Define its output as inspectable evidence records. Separate extraction from scoring and outbound operations. Add budget caps, source allow-list, retries, cache with source-specific rights, tenant-isolated storage and manual review.

## Pilot acceptance checks
- At least 80% of named roles trace to current official or first-party evidence (target).
- At least 90% of signals support their category and date (target).
- Zero records labeled as owner-confirmed financing need from web research alone.
- Track real cost and researcher review minutes per verified record.


## Commercial financing opportunity expansion (2026-10-21)

### Dual origination tracks
**Track A — Business financing:** operating businesses seeking working capital, inventory/receivables finance, equipment leasing, acquisition capital, expansion funding and debt restructuring (need only confirmed through owner conversation).
**Track B — Commercial real estate financing:** owner-occupied acquisitions, investment-property acquisitions/refinancing, industrial and retail facilities, land acquisition, development/construction financing, bridge loans and repositioning.

A company can trigger both tracks. Link financing opportunities to separate entities: operating company, property-owning corporation, project/SPV and registered land title. Never assume the occupier owns the premises or that a development permit establishes loan demand.

### Signal → financing conversation matrix
| Verifiable signal | Finance hypothesis | Required extra verification |
|---|---|---|
| Purchase/sale of commercial property announced | Acquisition mortgage, bridge or vendor take-back | Buyer, asset, transaction stage, funding status |
| Owner-occupied industrial facility expansion | Construction mortgage, capex, equipment | Land ownership, construction stage, disclosed funding |
| New commercial or mixed-use development | Land, development, construction or take-out financing | Developer/sponsor, parcel PID, zoning/permit timeline, current lender |
| Renovation/repositioning/tenant improvements | Capex, bridge or refinancing | Owner/tenant responsibility, project budget and existing funding |
| Operating-business expansion at a leased site | Equipment, working capital, leasehold improvements | Lease versus ownership, investment and decision-maker |
| Public mortgage registration / title charge | **Research only** for possible refinance | Official title, charge type, authorized borrower confirmation; no inferred maturity or distress |
| Public funding/grant award | Possible residual capital need, not necessarily | Grant terms, total project cost, remaining capital requirement |

### BC commercial-property research chain
1. Discover candidate property/project via public planning/permit datasets, company announcements and permitted directory sources.
2. Resolve civic address → PID using approved geospatial sources such as ParcelMap BC.
3. Obtain a current LTSA title **only when needed and authorized**, then record registered owner and charges with source/access rights; distinguish corporate owner from beneficial owner.
4. Match corporate title holder to BC Registry/OrgBook; research directors and authorized contacts through lawful sources. Director ≠ beneficial owner ≠ borrowing decision-maker.
5. Enrich project details and lender/financing signals with TinyFish on accessible, permitted public pages.
6. Build a short prospect briefing showing actual evidence, unanswered financing questions, and broker-mandate relevance.
7. Route to a licensed professional after human review and lawful-contact checks; mark actual financing requirement **UNKNOWN** until borrower authorization/confirmation.

### New data model (proposed)
- `financing_opportunities`: opportunity_id, account_id, track (business|commercial_real_estate), scenario (acquisition|refinance|construction|bridge|equipment|working_capital|ABL|other), signal_id, estimated_need_range (nullable), need_confirmation (unknown|confirmed|not_interested), discovery_stage, broker_mandate_id, next_action.
- `properties`: property_id, civic_address, PID (verified nullable), asset_type, property_use, ownership_verification_status, ownership_source, checked_at.
- `property_parties`: property_id, entity_id, role (registered_owner|occupant|developer|borrower|property_manager), evidence_source, confidence.
- `financing_signals`: source_url, published_at, retrieved_at, signal_type, exact_assertion, verification_state, evidence_license, stage.
- `capital_context`: disclosed_grants, publicly_announced_financing, project_budget, existing_charge_verified, all with provenance and UNKNOWN defaults.
- `decision_makers`: person_id, company_id, verified_role, source, observed_at, outreach_permission.

Do not surface unverified estimated equity, LTV, mortgage balance, refinancing date, NOI, DSCR or owner personal contact data.

### Revised commercial finance intelligence card
**Operating company** / **property or project** / **linked ownership entity** (each separately verified)
- Financing track and possible structures
- Project stage and timing, official records and URLs
- Existing publicly disclosed funding (if known)
- Named authorized contact with source-date and role confidence
- Unanswered qualification: property ownership, funding need, loan purpose, approximate amount, security, timing, current lender, exit
- Broker match and next permitted action
- Financing status: **UNCONFIRMED** until verified by authorized borrower

### Example reinterpretation of pilot records
- **ACSI:** dedicated industrial facility expansion indicates a *potential* construction, real estate or equipment financing conversation; public source does not establish that ACSI owns the land or needs debt. Investigate parcel/title and financing arrangements before qualification.
- **Flagship Logistics:** new warehouse operation indicates potential fleet/material-handling equipment or growth funding; occupancy does not imply property ownership. Need owner/lease verification before discussing mortgage products.
- **Government-supported Surrey companies:** publicly announced support reduces uncertainty about some financing already available. Do not label grant recipients as seeking additional capital.

### Success criteria
Measure separately by track: evidence-backed opportunities, verified decision-maker, owner-confirmed financing conversations, broker acceptance, accepted mandates, funded transactions, acquisition cost and elapsed days; never aggregate hypothetical leads with confirmed mandates.
