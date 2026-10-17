/** Pure internal planning only. No network, storage, scheduling or delivery. */
export type OutreachMotion = 'platform_sales' | 'broker_origination' | 'contractor_growth';
export type OutreachChannel = 'email' | 'phone' | 'introduction';
export type OutreachState = 'research' | 'hold' | 'review' | 'ready_for_manual_action';

export interface OutreachCandidate {
  organizationId: string;
  id: string;
  motion: OutreachMotion;
  channel: OutreachChannel;
  synthetic: boolean;
  fit: 'confirmed' | 'unknown' | 'excluded';
  offerApproved: boolean;
  roleConfirmed: boolean;
  sourceAllowed: boolean;
  evidenceVersion: string;
  verifiedAt: string | null;
  evidenceConflicted: boolean;
  suppressed: boolean;
  replied: boolean;
  meetingBooked: boolean;
  ownershipConflict: boolean;
  contactBasis: { status: 'approved' | 'unknown' | 'denied'; evidenceId: string | null; expiresAt: string | null };
  contentVersion: string;
  approval: {
    actorId: string;
    candidateId: string;
    motion: OutreachMotion;
    channel: OutreachChannel;
    contentVersion: string;
    evidenceVersion: string;
    expiresAt: string;
  } | null;
}

export interface OutreachPlan {
  state: OutreachState;
  reasons: string[];
  nextAction: 'verify' | 'resolve_hold' | 'review_draft' | 'manual_action';
  deliveryEnabled: false;
}

/** Caller must supply a server-verified organization; this function is not auth. */
export function planOutreach(
  candidate: OutreachCandidate,
  context: { organizationId: string; now: string; freshnessDays: number },
): OutreachPlan {
  const now = Date.parse(context.now);
  if (!Number.isFinite(now) || !Number.isFinite(context.freshnessDays) || context.freshnessDays <= 0) {
    throw new Error('Valid clock and positive freshness window required');
  }
  if (!context.organizationId || candidate.organizationId !== context.organizationId) {
    throw new Error('Organization mismatch');
  }
  const result = (state: OutreachState, reasons: string[]): OutreachPlan => ({
    state, reasons, deliveryEnabled: false,
    nextAction: state === 'research' ? 'verify' : state === 'hold' ? 'resolve_hold'
      : state === 'review' ? 'review_draft' : 'manual_action',
  });
  const holds: string[] = [];
  if (candidate.synthetic) holds.push('synthetic_record');
  if (candidate.suppressed) holds.push('suppressed');
  if (candidate.replied) holds.push('reply_requires_owner_handling');
  if (candidate.meetingBooked) holds.push('meeting_already_booked');
  if (candidate.ownershipConflict) holds.push('ownership_conflict');
  if (candidate.fit === 'excluded') holds.push('excluded_fit');
  if (!candidate.sourceAllowed) holds.push('source_use_restricted');
  if (candidate.contactBasis.status === 'denied') holds.push('contact_not_permitted');
  if (holds.length) return result('hold', holds);

  const research: string[] = [];
  const verified = candidate.verifiedAt ? Date.parse(candidate.verifiedAt) : NaN;
  if (!Number.isFinite(verified) || verified > now || now - verified > context.freshnessDays * 86_400_000) {
    research.push('evidence_missing_stale_or_future');
  }
  if (!candidate.evidenceVersion.trim()) research.push('evidence_version_missing');
  if (candidate.evidenceConflicted) research.push('evidence_conflicted');
  if (candidate.fit !== 'confirmed') research.push('fit_unconfirmed');
  if (!candidate.roleConfirmed) research.push('role_unconfirmed');
  if (!candidate.offerApproved) research.push('offer_unapproved');
  const basisExpiry = candidate.contactBasis.expiresAt ? Date.parse(candidate.contactBasis.expiresAt) : NaN;
  if (candidate.contactBasis.status !== 'approved' || !candidate.contactBasis.evidenceId?.trim()
    || !Number.isFinite(basisExpiry) || basisExpiry <= now) research.push('contact_basis_missing_or_expired');
  if (research.length) return result('research', research);

  const approval = candidate.approval;
  if (!candidate.contentVersion.trim() || !approval || !approval.actorId.trim()
    || approval.candidateId !== candidate.id || approval.motion !== candidate.motion
    || approval.channel !== candidate.channel || approval.contentVersion !== candidate.contentVersion
    || approval.evidenceVersion !== candidate.evidenceVersion
    || !Number.isFinite(Date.parse(approval.expiresAt)) || Date.parse(approval.expiresAt) <= now) {
    return result('review', ['current_draft_approval_required']);
  }
  return result('ready_for_manual_action', ['planning_checks_passed_delivery_disabled']);
}

/** Stable tuple encoding avoids delimiter collisions; not a substitute for a DB unique constraint. */
export function outreachActionKey(input: {
  organizationId: string; candidateId: string; campaignId: string; enrollmentVersion: string;
  channel: OutreachChannel; stepId: string;
}): string {
  const parts = [input.organizationId, input.candidateId, input.campaignId,
    input.enrollmentVersion, input.channel, input.stepId];
  if (parts.some(value => !value?.trim())) throw new Error('Complete action identity required');
  return JSON.stringify(parts);
}
