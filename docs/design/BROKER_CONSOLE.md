# Broker console — design spec (prototype v0.2)

**Status:** approved design direction for the authenticated app's first screens. Static prototype only — no auth, database, CRM or messaging integration exists yet.
**Prototype:** [`prototypes/broker-console.html`](prototypes/broker-console.html) — open it directly in a browser; it has no build step and makes no network calls except Google Fonts.
**Primary persona:** commercial mortgage / development-finance broker (origination team).

## 1. Purpose

Give a broker one place to (1) spot BC construction projects that will need financing, (2) move them through a loan pipeline, and (3) handle every conversation about them — while keeping CASL consent and demo/verified data boundaries visible at all times.

## 2. Screens

| Screen | Job | Key behaviour in prototype |
|---|---|---|
| Overview | "What needs me today?" | KPIs (tracked projects, open pipeline, stage-weighted pipeline, funded YTD); **Act today** list (unread conversations, deal tasks due ≤3 days, score ≥80 projects without a deal, CASL implied consent expiring <60 days); pipeline-by-stage bars; new signals (7 days) with source. |
| Unified inbox | Answer clients without leaving the deal context | Email / LinkedIn / WhatsApp threads in one list; channel filter; connected-account health; thread header shows stakeholder, consent basis, linked project and deal stage/amount/next step; reply gate (account disconnected or no consent ⇒ disabled with reason); replies auto-log to outreach history; unmatched inbound sender ⇒ "Create stakeholder", shown with 6-month inquiry-based implied consent. |
| Projects | Find and qualify projects | Search + municipality / planning stage / min-score filters; briefing drawer with score drivers, financing hypothesis (65% LTC, 60–75% range), sourced signals, stakeholders, **Create opportunity**. |
| Capital pipeline | Work deals to funding | 7-stage kanban: Identified → Contacted → Discovery → Packaging → Lender review → Term sheet → Funded. Drag-and-drop on desktop, per-card stage menu for touch/keyboard; column counts and totals. |
| BC coverage map | See where activity is | Schematic municipality tile map (not to scale) shaded by est. cost / count / avg score; tile selects that municipality's projects; region summary. |
| Stakeholders & outreach | Manage relationships lawfully | Consent pill per organization (express / implied-EBR with end date / implied-published / none); Email disabled with no consent, Call always available; outreach log. |

## 3. Visual system (matches Lovable ClearCommercialConnect)

Taken from the Lovable project's `src/index.css` and `tailwind.config.ts`:

| Token | Light | Dark |
|---|---|---|
| Foreground / primary | navy `hsl(216 55% 15%)` / `hsl(216 55% 23%)` | white / gold `hsl(43 68% 52%)` |
| Accent (actions, focus) | blue `hsl(217 91% 53%)` | gold `hsl(43 68% 52%)` |
| Sidebar | navy `hsl(216 55% 15%)`, gold active marker | `hsl(216 55% 6%)` |
| Semantic | success emerald, warning amber, danger red (text shades darkened for contrast on white) | lighter variants |
| Type | Inter (UI), IBM Plex Mono (numbers, `tabular-nums`) | same |
| Radius | 8px (`--radius: 0.5rem`) | same |

When porting to Next.js/Tailwind 4, declare these as `@theme` tokens in `globals.css` rather than copying Tailwind 3 config.

## 4. Business rules assumed (need confirmation)

1. Pipeline stages and weights: 5 / 10 / 20 / 35 / 50 / 75 / 100 %. Weighted pipeline is labelled "planning estimate, not a forecast".
2. Target deal range $15M–$150M est. construction cost (used in score explanation).
3. Indicative loan = 65% loan-to-cost, shown as a 60–75% range, labelled hypothesis.
4. Scores rank attention only; never presented as funding likelihood (PRD non-goal).
5. Brand on the authenticated app: prototype says **KonstructionComOS**; Lovable header says **Klick2Client** (open — see FE-01).

## 5. Unified inbox — planned Unipile integration

Unipile is the candidate provider: one API for Gmail/Outlook/IMAP, LinkedIn, WhatsApp (and others), webhooks for new messages and account status, and a white-label hosted auth flow; priced per connected account. Verify current terms at https://www.unipile.com/pricing-api/ before committing.

```text
User accounts (Gmail/Outlook/LinkedIn/WhatsApp)
        │  connected via Unipile hosted auth (per user, per org)
        ▼
     Unipile ──webhook (new message / account status)──► Next.js route handler
                                                          ├─ verify webhook authenticity
                                                          ├─ idempotent upsert by provider message id
                                                          ├─ match sender → contact → project → deal
                                                          └─ write org-scoped rows (RLS)
                                                                   ▼
                                                    Supabase: messaging_accounts, threads,
                                                    messages, touchpoints (existing), consent
                                                                   ▼
                                                           Inbox UI (read via RLS)
Send: UI ─► server action ─► consent + account-status check (server-side) ─► Unipile send ─► log touchpoint
```

Rules:
- The **server** enforces the CASL gate before any send; the UI only mirrors it.
- Store the minimum message content needed; never log message bodies or addresses in application logs.
- Every table carries `organization_id`; webhooks resolve the org from the stored account mapping, never from payload fields alone.
- Unmatched senders create a *pending* contact for human approval, not an automatic stakeholder.

Risks to clear before build:
- **LinkedIn:** LinkedIn's User Agreement restricts third-party automation of member accounts. Limit scope to reading/replying, no bulk sends, and review Unipile's own position.
- **Data residency:** a third-party comparison lists Unipile hosting in the EU (France). PIPEDA allows cross-border transfer with transparency — confirm with Unipile and disclose in the privacy notice.
- **CASL** applies to LinkedIn/WhatsApp messages as well as email; one consent record covers all channels.

Open questions: launch channels (recommend Gmail + Outlook first), personal vs shared team inbox, auto vs approved creation of stakeholders from unknown senders.

## 6. Relationship to PR #1 (`feature/mock-dashboard`)

PR #1 contains a working Next.js mock dashboard (green workspace design, 4 views, tests, CSV export). This prototype supersedes its **visual design and information architecture**; much of its **engineering** should be kept.

| Keep from PR #1 | Change per this spec |
|---|---|
| Component split, `filterProjects` + tests, CSV export with synthetic disclosure, native `<dialog>` briefing, shortlist, ESLint/CI setup | Lovable navy/blue/gold tokens instead of green; 7 loan stages with loan amounts (not 4 qualification stages on project budgets); add Inbox, Coverage map, CASL consent + outreach log; Act-today overview |

Recommended port: build on PR #1's branch structure, one component per view, each file <350 lines:
`overview.tsx`, `inbox/` (`thread-list.tsx`, `thread-view.tsx`, `reply-gate.ts`), `projects-table.tsx`, `project-briefing.tsx`, `pipeline-board.tsx`, `coverage-map.tsx`, `stakeholders.tsx`; pure logic (`reply-gate`, weighting, consent expiry) unit-tested.

## 7. Data boundaries

All prototype records are invented and labelled as such on every screen. Synthetic fixtures must stay in `src/lib/demo*` and never be written to production tables or sent to a CRM (see `FRONTEND_INTEGRATION.md`).
