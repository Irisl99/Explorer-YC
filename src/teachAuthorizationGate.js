// TEACH-specific human-review gate for the Private Alpha Evidence-to-Action Contract v1.
//
// Deliberately NOT a modification of recommendationReleaseGate.js. That gate's own precondition --
// an already-bound, approved VerificationActivity matching the recommendation's exact target --
// was designed around the original, single, post-Diagnostic VERIFY role, and requiring it here
// would recreate exactly the release-gate/target circularity the prior mapping audit reported
// (a skill-specific activity would have to be bound before a target is even confirmed). TEACH's
// own evidence validity is fully established by evidenceToActionContract.js /
// clarifyingVerificationOutcome.js before this gate is ever consulted, so this gate asks a strictly
// narrower question: has a human reviewed and approved *this exact* confirmed target AND *this
// exact* proposed module/version/hash?
//
// VERIFY_MORE deliberately has no equivalent gate here -- Founder Decision 4 authorizes it to run
// automatically once action selection is deterministic and content is learner-eligible.
//
// Only APPROVE/REJECT are supported, not MODIFY: TEACH is authorized for exactly one confirmed
// skill by construction (evidenceToActionContract.js never emits more than one), so there is no
// alternative-target set for a human to modify into within this evidence. Introducing MODIFY here
// would require inventing scope this bounded contract does not have.

export const TEACH_AUTHORIZATION_GATE_VERSION = 'prealpha-teach-authorization-gate-v1';

const REVIEW_DECISION_TO_STATUS = { approve: 'APPROVED', reject: 'REJECTED' };

// actionResult: { action, confirmedSkill } -- the exact output shape of deriveAuthorizedAction
// (evidenceToActionContract.js) when action === 'TEACH', or of interpretClarifyingOutcome
// (clarifyingVerificationOutcome.js) normalized to the same shape by the caller.
// teachReview: the persisted DiagnosticSession.teachReview subdocument, or null.
// proposedActivity: the exact module/version/hash the review must bind to (from
// previewTeachActivity in teachActivitySelection.js), or null/omitted to check action-eligibility
// only (e.g. reporting NOT_APPLICABLE for a non-TEACH action) without yet knowing what content
// would be reviewed.
export function evaluateTeachAuthorizationGate({ action, confirmedSkill }, teachReview, proposedActivity = null) {
  const reasons = [];

  if (action !== 'TEACH' || !confirmedSkill) {
    reasons.push('No TEACH action is currently authorized by the evidence contract.');
    return { releaseStatus: 'NOT_APPLICABLE', reasons, gateVersion: TEACH_AUTHORIZATION_GATE_VERSION };
  }

  if (!teachReview || !teachReview.decision) {
    reasons.push('No human review decision has been recorded for this TEACH target yet.');
    return { releaseStatus: 'HUMAN_REVIEW_REQUIRED', reasons, gateVersion: TEACH_AUTHORIZATION_GATE_VERSION };
  }

  if (teachReview.confirmedSkill !== confirmedSkill) {
    reasons.push('The recorded review does not match the exact confirmed TEACH target.');
    return { releaseStatus: 'HUMAN_REVIEW_REQUIRED', reasons, gateVersion: TEACH_AUTHORIZATION_GATE_VERSION };
  }

  if (proposedActivity) {
    const item = proposedActivity.item || proposedActivity;
    if (teachReview.reviewedActivityId !== proposedActivity.activityId
      || teachReview.reviewedItemVersion !== item.itemVersion
      || teachReview.reviewedContentHash !== item.contentHash) {
      reasons.push('The reviewed module/version/hash no longer matches the exact currently-proposed content -- content drifted after review.');
      return { releaseStatus: 'HUMAN_REVIEW_REQUIRED', reasons, gateVersion: TEACH_AUTHORIZATION_GATE_VERSION };
    }
  }

  const releaseStatus = REVIEW_DECISION_TO_STATUS[teachReview.decision];
  if (!releaseStatus) {
    reasons.push(`Unrecognized TEACH review decision: ${teachReview.decision}`);
    return { releaseStatus: 'HUMAN_REVIEW_REQUIRED', reasons, gateVersion: TEACH_AUTHORIZATION_GATE_VERSION };
  }

  reasons.push(`Human reviewer recorded decision: ${teachReview.decision}.`);
  return { releaseStatus, reasons, gateVersion: TEACH_AUTHORIZATION_GATE_VERSION };
}
