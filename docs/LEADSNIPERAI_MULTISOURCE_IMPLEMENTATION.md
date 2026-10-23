# LeadSniperAI multi-source discovery — implementation slice

Date: 2026-10-21
Branch: `feature/leadsniper-multisource-discovery`
Status: Prototype integration code, NOT connected to production, no approved source credentials or rights verified.

## What's implemented
- Server-only provider adapters: Google Places (New) Text Search; Yelp Fusion business search; Yellow Pages **license-required guard**.
- Fail-closed explicit switches and server-only keys.
- No external network calls without an approval switch and API key.
- Raw results returned transiently; no DB storage, resale or outbound campaigns.
- Basic normalized source references and conservative within-request matching by business name + address.
- Errors isolated per provider; no claimed financing intent.

## Environment (server only)
```
GOOGLE_PLACES_APPROVED=false
GOOGLE_PLACES_API_KEY=
YELP_FUSION_APPROVED=false
YELP_FUSION_API_KEY=
```
Set an approval flag true only after reviewing provider terms for the proposed commercial workflow. No client-side NEXT_PUBLIC_ secrets.

## Example internal use
```ts
import { discover, groupCandidateReferences } from "@/lib/lead-sourcing/directory";
const results = await discover({ industry:"manufacturing", location:"Surrey, BC", limit:10 });
const groups = groupCandidateReferences(results.flatMap(r=>r.candidates));
```

## Not implemented / prerequisites
1. Verify up-to-date Google and Yelp terms for discovery, use in a lead product, field storage, attribution, commercial use and redistribution. Do not persist provider fields until approved.
2. Obtain Yellow Pages express licensed-access agreement and a documented technical feed specification before building the adapter. **Never scrape Yellow Pages.**
3. Add authenticated server-side actions with tenant isolation, rate limits, API call budgets, abuse protection and audited calls. Do not expose raw endpoint publicly.
4. Create independent first-party/authorized licensed company master records and locations. Distinguish parent companies from branches; stronger dedupe should include independently sourced websites and registry identifiers.
5. Add independently sourced evidence enrichment: company website, filings, public announcements, dated hiring and verified expansion; track source/expiry for each.
6. Keep research priority score distinct from creditworthiness and actual financing intent; only owner confirmation changes financing_need_status to confirmed.
7. Build broker review, permissioned referral routing, CASL compliance records, suppression lists, and human approval before outbound.
8. Test with fixtures, mocked API responses, quota failures, ambiguous names and provider restriction cases, then staged pilot.

## Pilot success metrics
Provider permission and data cost; returned relevant entities; deduplication precision; independently verified owner; owner-confirmed financing opportunity; broker acceptance and meeting rate.

## Source documentation
- Google Places New Text Search: https://developers.google.com/maps/documentation/places/web-service/text-search
- Google Places field masks: https://developers.google.com/maps/documentation/places/web-service/choose-fields
- Yellow Pages Canada terms: https://corporate.yp.ca/terms-of-use-agreement

This module is an implementation starting point; API requests were not tested against live provider keys.
