import test from 'node:test';
import assert from 'node:assert/strict';
import { planOutreach, outreachActionKey } from '../src/lib/gtm/outreach.ts';

const context = { organizationId: 'org-a', now: '2026-10-17T07:00:00Z', freshnessDays: 7 };
const fixture = () => ({
  organizationId: 'org-a', id: 'candidate-1', motion: 'broker_origination', channel: 'email',
  synthetic: false, fit: 'confirmed', offerApproved: true, roleConfirmed: true, sourceAllowed: true,
  evidenceVersion: 'e1', verifiedAt: '2026-10-16T07:00:00Z', evidenceConflicted: false,
  suppressed: false, replied: false, meetingBooked: false, ownershipConflict: false,
  contactBasis: { status: 'approved', evidenceId: 'basis-1', expiresAt: '2026-11-01T00:00:00Z' },
  contentVersion: 'c1', approval: { actorId: 'reviewer-1', candidateId: 'candidate-1',
    motion: 'broker_origination', channel: 'email', contentVersion: 'c1', evidenceVersion: 'e1',
    expiresAt: '2026-10-18T07:00:00Z' },
});

test('approved plan still cannot send or book', () => {
  const result = planOutreach(fixture(), context);
  assert.equal(result.state, 'ready_for_manual_action');
  assert.equal(result.deliveryEnabled, false);
});
test('server workspace mismatch is rejected', () => {
  assert.throws(() => planOutreach(fixture(), { ...context, organizationId: 'org-b' }), /Organization/);
});
for (const field of ['synthetic', 'suppressed', 'replied', 'meetingBooked', 'ownershipConflict']) {
  test(`${field} stops the sequence`, () => {
    assert.equal(planOutreach({ ...fixture(), [field]: true }, context).state, 'hold');
  });
}
test('source restrictions and explicit exclusion stop action', () => {
  assert.equal(planOutreach({ ...fixture(), sourceAllowed: false }, context).state, 'hold');
  assert.equal(planOutreach({ ...fixture(), fit: 'excluded' }, context).state, 'hold');
});
for (const verifiedAt of [null, 'invalid', '2026-09-01T00:00:00Z', '2026-10-18T00:00:00Z']) {
  test(`unusable verification time ${verifiedAt} needs research`, () => {
    assert.equal(planOutreach({ ...fixture(), verifiedAt }, context).state, 'research');
  });
}
test('freshness boundary is inclusive; next millisecond is stale', () => {
  const c = { ...fixture(), verifiedAt: '2026-10-10T07:00:00Z' };
  assert.equal(planOutreach(c, context).state, 'ready_for_manual_action');
  assert.equal(planOutreach(c, { ...context, now: '2026-10-17T07:00:00.001Z' }).state, 'research');
});
test('public contact without documented basis never becomes ready', () => {
  const c = fixture(); c.contactBasis.status = 'unknown';
  assert.equal(planOutreach(c, context).state, 'research');
});
test('basis expiration is checked even after approval', () => {
  const c = fixture(); c.contactBasis.expiresAt = context.now;
  assert.equal(planOutreach(c, context).state, 'research');
});
test('conflicts, missing role, missing offer and unknown fit require research', () => {
  for (const delta of [{ evidenceConflicted: true }, { roleConfirmed: false },
    { offerApproved: false }, { fit: 'unknown' }, { evidenceVersion: '' }]) {
    assert.equal(planOutreach({ ...fixture(), ...delta }, context).state, 'research');
  }
});
test('approval does not survive changed recipient, evidence, copy, channel or motion', () => {
  for (const delta of [{ id: 'other' }, { contentVersion: 'c2' }, { evidenceVersion: 'e2' },
    { channel: 'phone' }, { motion: 'platform_sales' }, { approval: null }]) {
    assert.equal(planOutreach({ ...fixture(), ...delta }, context).state, 'review');
  }
});
test('expired or malformed approval returns to review', () => {
  for (const expiresAt of [context.now, 'invalid']) {
    const c = fixture(); c.approval.expiresAt = expiresAt;
    assert.equal(planOutreach(c, context).state, 'review');
  }
});
test('suppression wins over research and earlier approval', () => {
  const result = planOutreach({ ...fixture(), suppressed: true, verifiedAt: null }, context);
  assert.equal(result.state, 'hold'); assert.ok(result.reasons.includes('suppressed'));
});
test('invalid planning clock/configuration is rejected', () => {
  for (const delta of [{ now: 'bad' }, { freshnessDays: 0 }, { freshnessDays: NaN }]) {
    assert.throws(() => planOutreach(fixture(), { ...context, ...delta }));
  }
});
test('action keys are retry-stable, tenant-separated and collision resistant', () => {
  const a = { organizationId: 'org-a', candidateId: 'x|y', campaignId: 'z',
    enrollmentVersion: '1', channel: 'email', stepId: 'first' };
  assert.equal(outreachActionKey(a), outreachActionKey({ ...a }));
  assert.notEqual(outreachActionKey(a), outreachActionKey({ ...a, organizationId: 'org-b' }));
  assert.notEqual(outreachActionKey(a), outreachActionKey({ ...a, candidateId: 'x', campaignId: 'y|z' }));
  assert.throws(() => outreachActionKey({ ...a, stepId: '' }));
});
