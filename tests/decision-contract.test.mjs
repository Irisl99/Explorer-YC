import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveAuthorizedAction } from '../src/evidenceToActionContract.js';
import { interpretClarifyingOutcome } from '../src/clarifyingVerificationOutcome.js';
import { evaluateTeachAuthorizationGate } from '../src/teachAuthorizationGate.js';
import { syntheticRecommendation, proposedActivity, syntheticReview, runSyntheticJourney } from '../examples/synthetic-decision-cases.mjs';

// All fixtures are synthetic; no identities, application records, or content assets.
test('synthetic journey separates hypothesis, convergence, and content release', () => {
  const j = runSyntheticJourney();
  assert.equal(j.stop.authorizedAction, 'NO_ACTION');
  assert.equal(j.investigate.authorizedAction, 'VERIFY_MORE');
  assert.equal(j.investigate.confirmedSkill, null);
  assert.equal(j.converge.action, 'TEACH');
  assert.equal(j.mixed.action, 'NO_ACTION');
  assert.equal(j.reviewRequired.releaseStatus, 'HUMAN_REVIEW_REQUIRED');
  assert.equal(j.approved.releaseStatus, 'APPROVED');
  assert.equal(j.driftBlocked.releaseStatus, 'HUMAN_REVIEW_REQUIRED');
});

test('missing, insufficient, and unrecognized recommendations stop', () => {
  for (const input of [null, {}, { inferenceLevel: 0, targetGranularity: 'skill', targetSkill: 'synthetic-skill-a' },
    { ...syntheticRecommendation, sourceItemEvidence: [{ correct: true, skill: 'synthetic-skill-a' }] }]) {
    assert.equal(deriveAuthorizedAction(input).authorizedAction, 'NO_ACTION');
  }
});

test('trusted upstream same-skill target authorizes teaching eligibility', () => {
  const r = deriveAuthorizedAction({ ...syntheticRecommendation, inferenceLevel: 2,
    targetGranularity: 'skill', targetSkill: 'synthetic-skill-a' });
  assert.equal(r.authorizedAction, 'TEACH');
  assert.equal(r.confirmedSkill, 'synthetic-skill-a');
  assert.deepEqual(r.provisionalSkills, []);
});

test('incomplete follow-up evidence cannot be treated as incorrect', () => {
  for (const evidence of [{}, { 'synthetic-skill-a': null }, { 'synthetic-skill-a': 'false' }]) {
    const r = interpretClarifyingOutcome(['synthetic-skill-a'], evidence);
    assert.equal(r.action, 'NO_ACTION');
    assert.equal(r.reasonCode, 'CLARIFYING_EVIDENCE_INCOMPLETE');
    assert.equal(r.convergedSkill, null);
  }
});

test('multiple supported targets do not silently become a unique priority', () => {
  const r = interpretClarifyingOutcome(['synthetic-skill-a', 'synthetic-skill-b'],
    { 'synthetic-skill-a': false, 'synthetic-skill-b': false });
  assert.equal(r.action, 'NO_ACTION');
  assert.equal(r.reasonCode, 'MULTIPLE_SUPPORTED_TARGETS_NO_UNIQUE_PRIORITY');
  assert.equal(r.convergedSkill, null);
  assert.equal(r.convergedSkills.length, 2);
});

const action = { action: 'TEACH', confirmedSkill: 'synthetic-skill-a' };
test('target, module ID, version, and hash drift each require renewed review', () => {
  for (const changed of [
    { ...syntheticReview, confirmedSkill: 'synthetic-skill-b' },
    { ...syntheticReview, reviewedActivityId: 'synthetic-module-b' },
    { ...syntheticReview, reviewedItemVersion: 'synthetic-v2' },
    { ...syntheticReview, reviewedContentHash: 'b'.repeat(64) },
  ]) {
    assert.equal(evaluateTeachAuthorizationGate(action, changed, proposedActivity).releaseStatus, 'HUMAN_REVIEW_REQUIRED');
  }
});

test('review rejection and unknown decisions cannot approve release', () => {
  assert.equal(evaluateTeachAuthorizationGate(action, { ...syntheticReview, decision: 'reject' }, proposedActivity).releaseStatus, 'REJECTED');
  assert.equal(evaluateTeachAuthorizationGate(action, { ...syntheticReview, decision: 'unknown' }, proposedActivity).releaseStatus, 'HUMAN_REVIEW_REQUIRED');
  assert.equal(evaluateTeachAuthorizationGate({ action: 'NO_ACTION', confirmedSkill: null }, syntheticReview, proposedActivity).releaseStatus, 'NOT_APPLICABLE');
});

test('review-only mode does not establish proposed content binding', () => {
  // Existing API allows this: release callers must require valid proposedActivity.
  assert.equal(evaluateTeachAuthorizationGate(action, syntheticReview).releaseStatus, 'APPROVED');
});
