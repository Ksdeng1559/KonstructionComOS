# Harvey outreach integration

Harvey runs as a **separate Python worker**, pinned in `services/harvey` as a Git submodule from [Ksdeng1559/harvey](https://github.com/Ksdeng1559/harvey). It is not imported into Next.js, and this commit does **not** provide a live email API or start automated outreach.

## Checkout / setup

```bash
git clone --recurse-submodules https://github.com/Ksdeng1559/KonstructionComOS.git
cd KonstructionComOS
git checkout feature/harvey-outreach-integration
git submodule update --init --recursive
cd services/harvey
python3.11 -m venv .venv
source .venv/bin/activate
pip install -e .
cp .env.example .env
# configure Harvey's provider, mailbox and rate limits locally; do not commit secrets
harvey dashboard
```

Windows PowerShell: `py -3.11 -m venv .venv`, `.venv\Scripts\Activate.ps1`. Consult Harvey README for Claude/Codex platform restrictions and supported commands.

## Integration boundary

**KonstructionComOS:** verified construction-project intelligence, workspace identity, stakeholder links, opportunities and review approvals.
**LeadSniperAI:** canonical cross-vertical prospect identity, growth signals, deduplication, buyer matching, consent/suppression and API worker permissions.
**Harvey:** provider discovery (including DataForSEO), website profiling, prospect research, approved message drafting, approval-controlled sending and reply handling.
**Atomic CRM:** relationship stages and follow-ups, not source of truth for outreach permissions.

Harvey v0.3.0 already advertises DataForSEO listings/SERP, review metrics, signal cohorts and an approval outbox. **Reuse those provider adapters**; do not build duplicate paid API ingestion. Actual cross-repository synchronization is **not implemented** by the submodule.

## Outreach workflow (target design)

1. User selects a tenant and a `client.brain.md` targeting strategy.
2. Source discovery uses LeadSniperAI and/or Harvey's existing DataForSEO provider; dedupe by source IDs, domain/phone/location.
3. Evidence cards show source, observation date, verifiability and reason to engage. Label review-count gaps as hypotheses, not demand.
4. Operator chooses strategy: contractor jobs/appointments, broker-facing customer acquisition, verified commercial borrower introduction, or substantiated business expansion.
5. A human approves prospect and legal basis for contact (CASL/BC privacy, opt-out, conflicts, territory/offer fit).
6. Harvey Writer drafts outreach referencing **only verified facts**. A second human approval gates each message before sender; default safe behavior is no sends.
7. Harvey Handler may classify incoming responses and propose replies; human approval is required before a new message is sent.
8. Calendar-confirmed meeting + contact outcomes are synchronized into the tenant CRM with idempotency, source attribution and audit logs.

**Do not confuse:** (a) B2B sales calls to sell growth services to a contractor; (b) the contractor's consumer estimate appointments; (c) commercial borrower consultations for a broker. These require separate appointment types and KPIs.

## Target future contract (not available as a live API yet)

```ts
export type OutreachStrategy =
  | "construction_jobs_appointments"
  | "commercial_mortgage_broker_growth"
  | "business_expansion_intelligence";
export interface OutreachDraftRequest {
  opportunityId: string;
  strategy: OutreachStrategy;
  evidenceIds: string[];
  channel: "email";
}
export interface OutreachApproval {
  draftId: string;
  approverId: string;
  contactPermissionVerified: boolean;
  caslBasisRecorded: boolean;
  suppressionCheckedAt: string;
  approvedAt: string;
}
```

**Security invariants:** derive tenant from authenticated server context, not a client-provided tenant ID; server-to-server credentials in secrets manager only; deny outbound on absent consent/exemption evidence or suppression; enforce review approval and tenant RLS; maintain idempotency and no duplicate messages. Treat public email availability and email deliverability as different from legal permission.

## Operational steps to complete before enabling sending

- [ ] Inspect Harvey's existing providers, agent/outbox methods, scheduler, SQLite models and supported APIs in the pinned commit.
- [ ] Agree canonical cross-app company/contact IDs, `client.brain.md` strategy schema and data-transfer permissions.
- [ ] Build a private authenticated service adapter or event queue (no direct internet-accessible Harvey SQLite endpoint).
- [ ] Implement Supabase tenant/permission/outreach audits with two-tenant denial tests.
- [ ] Connect an approved mailbox and secure response webhook or polling worker; log deliveries/replies, confirmations, bounces/unsubscribes.
- [ ] Record CASL lawful basis and email identification/unsubscribe controls; legal review for Canadian commercial financing/referral activities.
- [ ] Enable a test campaign to *internal seed addresses only*; review logs and rollback before any real prospect outreach.
- [ ] Update worker commit via `git -C services/harvey fetch`, checkout reviewed SHA, and commit the parent submodule pointer.

## Additional reading
- [Harvey fork integration plan](https://github.com/Ksdeng1559/harvey/blob/feature/leadsniper-growth-signals/docs/integrations/leadsniper-growth-signal-engine.md)
- [LeadSniperAI Notion PRD](https://app.notion.com/p/3fc9e94cf0a481d1ad98d01f9bfaf95c)
