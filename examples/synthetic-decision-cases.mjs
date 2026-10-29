import { pathToFileURL } from 'node:url';
import { deriveAuthorizedAction } from '../src/evidenceToActionContract.js';
import { interpretClarifyingOutcome } from '../src/clarifyingVerificationOutcome.js';
import { evaluateTeachAuthorizationGate } from '../src/teachAuthorizationGate.js';

// Entirely invented evidence and review records; no learner or reviewer identities.
export const syntheticRecommendation = {
  evidenceState: 'evidence_available', inferenceLevel: 1,
  targetGranularity: 'domain', targetSection: 'Math',
  targetDomain: 'synthetic-domain',
  sourceItemEvidence: [{ correct: false, skill: 'synthetic-skill-a' }],
};
export const proposedActivity = {
  activityId: 'synthetic-module-a',
  item: { itemVersion: 'synthetic-v1', contentHash: 'a'.repeat(64) },
};
export const syntheticReview = {
  decision: 'approve', confirmedSkill: 'synthetic-skill-a',
  reviewedActivityId: proposedActivity.activityId,
  reviewedItemVersion: proposedActivity.item.itemVersion,
  reviewedContentHash: proposedActivity.item.contentHash,
};

export function runSyntheticJourney() {
  const stop = deriveAuthorizedAction({ evidenceState: 'evidence_insufficient', inferenceLevel: 0 });
  const investigate = deriveAuthorizedAction(syntheticRecommendation);
  const converge = interpretClarifyingOutcome(investigate.provisionalSkills, { 'synthetic-skill-a': false });
  const mixed = interpretClarifyingOutcome(investigate.provisionalSkills, { 'synthetic-skill-a': true });
  const normalized = { action: converge.action, confirmedSkill: converge.convergedSkill };
  return {
    syntheticOnly: true, stop, investigate, converge, mixed,
    reviewRequired: evaluateTeachAuthorizationGate(normalized, null, proposedActivity),
    approved: evaluateTeachAuthorizationGate(normalized, syntheticReview, proposedActivity),
    driftBlocked: evaluateTeachAuthorizationGate(normalized, syntheticReview, {
      ...proposedActivity, item: { ...proposedActivity.item, itemVersion: 'synthetic-v2' },
    }),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(runSyntheticJourney(), null, 2));
}
