# Product–Market Fit Evidence Update

**Updated:** October 21, 2026  
**Geography:** British Columbia MVP; national expansion conditional  
**Product decision:** Reposition the finance-broker beachhead around **direct business-owner access and multiple financing solutions**, with construction intelligence as an additional signal source.

## Executive decision — broker-feedback-led pivot
Recent qualitative conversations with commercial mortgage brokers, as reported by the product owner, indicate a stronger expressed preference for **speaking directly to operating business owners** and offering multiple financing options than for receiving construction project lists alone. Preserve the distinction between **voice-of-customer feedback**, **external market/problem evidence**, and **paid product-market-fit evidence**. Broker interview count, sampling, quotes, willingness to pay and actual paid use have not been documented. Treat this as a compelling hypothesis warranting a test, not verified PMF.

**Core product hypothesis:** A business-first sourcing + owner-research + financing-signal workflow yields more owner-confirmed, mandate-relevant meetings per broker-hour than project-only sourcing or generic business directories.

### Revised jobs to be done
- **Commercial/business finance broker:** Find verified owners/authorized decision-makers with credible capital events; start direct conversations, qualify multiple financing products, and manage follow-up/mandates.
- **Business/property owner:** Receive relevant financing pathways and connect with an appropriately qualified broker through permissioned intake.
- **Commercial property-focused broker:** Identify owners, sponsors and corporate borrowers with a grounded property/transaction event, then confirm financing timing and structure.
- **Contractor/CRE project-pursuit teams:** Retain as separate potential verticals; do not use their buyers in a broker-only market denominator.

### Segments and product opportunities
| Signal / prospect | Financing conversation to investigate | Required qualification |
|---|---|---|
| Operating manufacturer expands facility | Commercial mortgage, equipment loan, working capital | Owns vs leases, amount, timing, funding already secured |
| Logistics firm relocates or grows fleet | Equipment/vehicle financing, working capital, owner-occupied purchase | Ownership, capex scope, lease, decision-maker |
| Contractor receives major contract | Revolving line, receivables/PO financing, equipment | Contract terms, cash cycle, confirmed need |
| Corporate owner purchases/refinances commercial property | Acquisition mortgage, bridge/refinance | Registered title, property and buyer, funding stage |
| Developer starts rezoning/construction | Land, construction, bridge/take-out financing | Sponsor, project stage, capital structure and lender |
| Acquisition or succession announced | Business acquisition and possible property financing | Transaction and owner-confirmed funding need |

A business may have multiple related financing opportunities; do not confuse a corporate officer with a beneficial property owner, or facility occupancy with title ownership.

### Data-source architecture and evidence hierarchy
1. **Discovery (permission-dependent):** Google Places, Yelp API, licensed Yellow Pages and permitted third-party data services. Apify Actors may reduce engineering cost but do **not** override source licensing or resale restrictions.
2. **First-party/independent research:** TinyFish, Scrapling and Exa/Tavily/Parallel on company websites, dated public announcements and official publications. Each assertion requires source URL, date, freshness and confidence.
3. **BC corporate/property verification:** OrgBook BC, BC Registry, ParcelMap BC, targeted LTSA title retrieval and licensed BC Assessment data where needed. Record which individual/entity was verified and by which source.
4. **Qualification:** Score research priority, not borrowing need or creditworthiness. Qualified financing opportunity requires authorized business-owner/borrower confirmation; record existing public grants/funding as possible reductions to unmet need.
5. **Broker workflow:** Company Intelligence Card, two finance track filters, Chief of Staff briefing, human-approved outreach, broker routing, conversation, mandate and funding outcomes. Tenant isolation and CASL/privacy controls are mandatory.

### Updated MVP and success metrics
**First test cohort:** 3–5 commercial/business-finance broker teams in Metro Vancouver/Fraser Valley; focus on manufacturing, logistics and construction-related SMEs while also testing a small commercial property finance stream.

**Suggested 30-day *targets, not actual results*:** discover 300 permissioned business candidates; independently research 100; verify 50 relevant decision-makers; achieve 20 owner conversations and 5 owner-confirmed financing needs, with separate counts for commercial property and business finance.

**Primary PMF evidence:** number of net-new owner-confirmed finance conversations per subscribing broker team, meeting acceptance, attributable broker mandates, renewal at disclosed price, broker time saved, cost per accepted opportunity, source rights and marginal data/agent cost.

**Control/benchmark:** Compare against generic directory prospecting and the previous construction-project-first approach using the same broker team and tracking method. Break down by finance product and segment; do not attribute existing broker relationships as net-new.

**Decision gates:** Continue if a majority of paid pilot teams repeatedly act on verified intelligence, book attributable relevant owner conversations and renew at sustainable pricing. If not, narrow the signal set, customer segment or offer. No public claim of PMF, premium conversion uplift, exclusive leads, or guaranteed appointments without actual measurements.

### Revised TAM/SAM interpretation
Previous construction-industry TAM/SAM estimates are **historical planning scenarios only**. They counted construction and related service organizations as possible intelligence subscribers, not a verified universe of financing brokers, and are not additive to the business-owner audience. A defensible new market model needs:
- Verified count of independent Canadian and BC *commercial/business financing broker buying teams* (not individual mortgage licensees or businesses that might borrow).
- Relevant org/team share, unique-parent deduplication, licensed BC data coverage and price actually tested.
- Separate borrower-opportunity inventory (companies/properties), not included in subscriber TAM.
- Separate commission, appointment and lead revenue models and conversion validation; do not conflate these with SaaS ARR.
- Separate national scaling assumptions rather than extrapolation from BC without evidence.

**Evidence confidence:** moderate that the reported customer conversations motivate the pivot, low on preference prevalence or paid demand, and unproven on conversion, retention, incremental margin and TAM.

---
## Earlier external market/problem evidence (retained for context; construction-first positioning below is historical)

**Updated:** October 19, 2026  
**Geography:** Canada, with British Columbia as the launch market  
**Purpose:** Add external evidence to the existing TAM/SAM and product–market-fit hypotheses. This evidence supports the relevance of selected problems; it does not demonstrate KommercialConnect adoption, retention, willingness to pay, or product–market fit.

## Executive read

The evidence strengthens three testable problem hypotheses:

1. **Finance brokers:** relevant project and business signals may help brokers find and qualify conversations. ISED’s 2025 survey shows that some small businesses do not seek financing because they are unaware of sources, while debt requests serve varied purposes. It does not measure broker lead-generation pain directly.
2. **Contractors:** project pursuit takes place in an environment of procurement uncertainty, contract risk, and cash-flow pressure. This supports a workflow for finding and qualifying suitable pursuits, but does not show that project intelligence will resolve late payment or contract risk.
3. **Business owners:** some owners may benefit from clearer financing pathways and a way to reach an appropriate broker. The evidence does not support claiming that most businesses are rejected: reported approval rates were high in 2025.

**Commercial real estate brokers:** the research reviewed did not produce a strong, current Canadian statistic directly measuring commercial brokers’ difficulty finding owners, projects, or mandates. Keep this as an interview and paid-pilot hypothesis.

## Evidence and product implications

| Evidence | What it supports | Product response to test | What it does not establish |
|---|---|---|---|
| In ISED’s 2025 Credit Conditions Survey, 20% of small businesses requested debt financing. Of those requests, 97% were fully or partially approved nationally; the BC and territories row reports a 21% debt request rate and 92% approval rate. | Financing conversations exist, but the market should not be framed as widespread rejection. Regional and business-specific needs can differ. | Owner intake by purpose, amount, timing, and business/property context; broker routing; status recorded as unknown until confirmed. | Broker demand, borrower satisfaction, time-to-financing, or KommercialConnect conversion. |
| Among small businesses that did not seek external financing in 2025, ISED lists “unaware of financing sources” as 6% and “applying … too difficult or time consuming” as 2%. | Awareness and process friction affect a subset of non-applicants. | Plain-language financing pathways and a low-friction request for a broker conversation, with consent and clear next steps. | That these owners want an intermediary, that all unserved demand is financeable, or that a directory alone solves the issue. |
| Among small businesses requesting debt in 2025, intended uses included working/operating capital (45%), debt consolidation (24%), fixed assets (22%), and purchase/expansion of a business (8%). | Business financing needs are diverse and require qualification beyond a generic loan inquiry. | Structured intake that distinguishes use of funds, timing, amount, security/property, and current financing status. | Approval likelihood for an individual borrower or availability of a product. |
| BCCA’s 2026 BC construction survey summary reports 858 employer/tradesperson respondents; 89% said they had been paid late at least once in the prior year, and 61% reported late payment on more than one-quarter of completed work. | Cash-flow strain is an industry concern and may make access to relevant capital conversations valuable to some firms. | Contractor/business owner intake for working capital or other financing needs, separate from project-pursuit workflows. | That project discovery prevents late payment or that every contractor needs financing. |
| The same BCCA summary reports an average 14.5% risk premium in bids and that 43% cite onerous contract clauses as the main reason they do not bid on public projects. | Bid/no-bid decisions are affected by risk and procurement conditions, not only by lack of project visibility. | Contractor filters and qualification should include project stage, procurement/award status, scope, geography, and contract/opportunity context where verified. | That more project alerts improve win rates, margins, or contract terms. |
| The BCCA summary cites approximately $173 billion in planned BC construction projects. | The province has substantial planned project activity, making project intelligence a plausible workflow to test. | Measure coverage, freshness, and relevance within a bounded launch territory before expanding. | Addressable software spend, accessible opportunities, customer demand, or the percentage the platform can cover. |

### Source notes

- **ISED, Credit Conditions Survey 2025:** Surveyed 1,812 small businesses (1–99 employees) between January and March 2026 about financing sought in calendar year 2025. The reported 97% approval rate counts full or partial approval. The regional BC and territories figure should not be described as BC-only.
- **BCCA / VICA, 2026 BC Construction Industry Survey & Spring Stat Pack:** VICA’s April 16, 2026 summary reports findings from 858 employers and tradespeople across BC’s seven development regions. The figures above are attributed to that summary; validate against the original BCCA report before using detailed survey methodology or segmentation in external materials.
- Percentages refer to different survey populations and questions. They should not be combined into a single “market need” rate.

## Segment-by-segment fit hypotheses

### 1. Commercial finance brokers — beachhead hypothesis

**Problem to test:** brokers need earlier, relevant project and sponsor context, but public construction signals do not prove financing intent.

**Solution hypothesis:** a source-backed project registry, stakeholder map, explicit data freshness/confidence, financing qualification fields, and a capital-origination pipeline can help brokers move from discovery to a sponsor-confirmed financing discussion.

**Evidence needed for fit:**
- Broker interviews show repeated cases where a relevant sponsor was hard to identify or reach.
- Users act on discovered projects and record sponsor-confirmed financing discussions.
- Teams renew at disclosed pricing and outcomes can be attributed to platform-supported discovery.

### 2. Contractors — parallel pilot hypothesis

**Problem to test:** contractors need suitable pursuit opportunities and usable procurement context while managing uncertain project risk and payment conditions.

**Solution hypothesis:** trade-, territory-, and stage-specific discovery plus verification of scope and procurement status can help contractors prioritize pursuits and track stakeholder follow-up.

**Evidence needed for fit:**
- Specific trades identify missed or poor-fit pursuits and a measurable research burden.
- Platform-discovered records lead to real stakeholder conversations, invitations to bid, or other qualified pursuit outcomes.
- Teams use the workflow repeatedly and renew; results are measured separately by specialty.

### 3. Business owners seeking financing — borrower-facing pathway

**Problem to test:** some owners are unaware of financing sources or find applying difficult/time-consuming; financing needs differ by purpose.

**Solution hypothesis:** an understandable financing information directory and consent-based intake can help an owner describe the need and reach a relevant finance broker.

**Evidence needed for fit:**
- Owners complete the intake and consent to broker contact.
- Brokers accept and respond to the routed inquiries.
- Owners report that the pathway clarified their next step; measure completion, contact, qualification, and drop-off.

Do not use the 6% awareness statistic to suggest that all business owners lack financing information. Most non-seekers in the ISED survey reported that financing was not needed.

### 4. Commercial real estate brokers — validation required

**Problem to test:** project and planning signals may create useful owner, land, investment-sales, leasing, or development mandate conversations.

**Solution hypothesis:** connect dated project activity with verified ownership/stakeholder context and relationship follow-up.

**Evidence gap:** no strong direct statistic was found in the research reviewed that quantifies this segment’s prospecting or mandate-discovery pain. Validate with commercial brokerage interviews and a distinct pilot cohort; do not use contractor or small-business financing statistics as a proxy.

## Recommended positioning supported by the evidence

> **KommercialConnect helps finance and real estate professionals find relevant project or business signals, verify the context, and organize the next conversation. Business owners can describe a financing need and connect with a relevant broker.**

Use segment-specific messages:

- **Finance brokers:** Find and qualify sponsor conversations around relevant project activity.
- **Contractors:** Focus on project pursuits that fit your trade, territory, and capacity.
- **Business owners:** Understand possible financing routes and request a conversation with a relevant broker.
- **Commercial real estate brokers:** Explore project-to-owner relationship workflows; validate the value before making quantified claims.

Avoid claims that KommercialConnect guarantees funding, approval, contracts, appointments, exclusive leads, or universal project coverage. A permit or project signal is a reason to investigate, not proof of financing need or a live opportunity.

## Update to the PMF validation plan

Retain the existing 90-day pilot plan and review cohorts separately. Add these measurements:

| Segment | Core outcome | Supporting measures |
|---|---|---|
| Finance brokers | Sponsor-confirmed qualified financing conversations attributable to platform discovery | Verified-project use, time to prepare, sponsor/contact confidence, financing status completeness, renewal |
| Contractors | Decision-maker-confirmed suitable pursuit opportunities | Trade and territory relevance, procurement status accuracy, bid invitations/submissions, repeated use, renewal |
| Business owners | Consent-based completed connection to a relevant broker | Intake completion, response time, broker acceptance, owner-reported clarity, qualification and drop-off |
| Commercial real estate brokers | Verified owner/developer conversations with credible mandate potential | Ownership confidence, stage relevance, meeting attribution, repeat use, paid renewal |

The external statistics establish **problem context**, while the above pilot measures test **solution value**. Only observed usage, customer outcomes, retention, and willingness to pay can establish PMF.

## References

1. [ISED — Credit Conditions Survey 2025](https://www.ised-isde.canada.ca/site/sme-research-statistics/en/survey-data-and-analysis/credit-conditions-survey/credit-conditions-survey-2025)
2. [ISED — Small Business Credit Condition Trends, 2015–2025](https://www.ised-isde.canada.ca/site/sme-research-statistics/en/research-reports/small-business-credit-condition-trends-2015-2025)
3. [VICA — 2026 BC Construction Industry Survey & Spring Stat Pack, April 16, 2026](https://www.vicabc.ca/news/2026-bc-construction-industry-survey-spring-stat-pack/)
4. [Statistics Canada — Survey on Financing and Growth of Small and Medium Enterprises, 2023](https://www150.statcan.gc.ca/n1/daily-quotidien/250220/dq250220e-eng.htm)
5. [KommercialConnect Features & Benefits page](FEATURES_AND_BENEFITS.md)
6. [Product Requirements Document](PRD.md)
