// Private Alpha Evidence-to-Action Contract v1.
//
// Sits between the frozen Decision 1 evidence (diagnosticRecommendation.js) and the next student
// action. Never mutates or re-derives Decision 1's own evidence -- it only reads the already-
// computed recommendation object and answers a narrower question: given exactly this evidence,
// what action is currently authorized?
//
// Deterministic, pure, no I/O, no randomness, no client input. Content availability is never an
// input to this function -- a target being authorized here says nothing about whether learner-
// eligible content actually exists for it (that is a separate, later, content-binding question).
//
// Frozen truth table (Private Alpha Evidence-to-Action Contract v1, Math-only):
//   Level 0 (evidence_insufficient)              -> NO_ACTION
//   Level 2, targetGranularity 'skill'            -> TEACH (direct same-skill convergence)
//   Level 1 or Level 2 domain-only                -> VERIFY_MORE, provisionalSkills = the
//                                                    incorrect item(s)' own skill(s) in the
//                                                    winning domain (1 or 2), carried strictly as
//                                                    a testable hypothesis, never as a confirmed
//                                                    TEACH target.

export const EVIDENCE_TO_ACTION_CONTRACT_VERSION = 'prealpha-evidence-to-action-v1';

export const AUTHORIZED_ACTIONS = Object.freeze({
  NO_ACTION: 'NO_ACTION',
  VERIFY_MORE: 'VERIFY_MORE',
  TEACH: 'TEACH',
});

function noAction(reasonCode) {
  return {
    contractVersion: EVIDENCE_TO_ACTION_CONTRACT_VERSION,
    authorizedAction: AUTHORIZED_ACTIONS.NO_ACTION,
    reasonCode,
    targetSection: null,
    targetDomain: null,
    confirmedSkill: null,
    provisionalSkills: [],
  };
}

export function deriveAuthorizedAction(recommendation) {
  if (!recommendation) return noAction('NO_RECOMMENDATION');
  if (recommendation.evidenceState === 'evidence_insufficient' || recommendation.inferenceLevel === 0) {
    return noAction(recommendation.level0Reason || 'EVIDENCE_INSUFFICIENT');
  }

  // Level 2 same-skill convergence: two independent wrong observations of the identical validated
  // skill already exist in Decision 1 itself. No VERIFY_MORE step is needed first.
  if (recommendation.targetGranularity === 'skill' && recommendation.targetSkill) {
    return {
      contractVersion: EVIDENCE_TO_ACTION_CONTRACT_VERSION,
      authorizedAction: AUTHORIZED_ACTIONS.TEACH,
      reasonCode: 'LEVEL_2_SAME_SKILL_CONVERGENCE',
      targetSection: recommendation.targetSection,
      targetDomain: recommendation.targetDomain,
      confirmedSkill: recommendation.targetSkill,
      provisionalSkills: [],
    };
  }

  // Domain-only: either a single error (Level 1) or two errors across different skills (Level 2,
  // sameSkill false). Neither meets the TEACH bar. The incorrect item(s)' own skill(s) become
  // provisional VERIFY_MORE hypotheses -- never populated into a definitive target field.
  if (recommendation.targetGranularity === 'domain' && recommendation.targetDomain) {
    const provisionalSkills = [...new Set(
      (recommendation.sourceItemEvidence || [])
        .filter(row => row.correct === false)
        .map(row => row.skill)
        .filter(Boolean),
    )];
    if (provisionalSkills.length === 0) return noAction('NO_INCORRECT_SKILL_EVIDENCE');
    return {
      contractVersion: EVIDENCE_TO_ACTION_CONTRACT_VERSION,
      authorizedAction: AUTHORIZED_ACTIONS.VERIFY_MORE,
      reasonCode: recommendation.inferenceLevel === 1 ? 'LEVEL_1_SINGLE_ERROR_DOMAIN_ONLY' : 'LEVEL_2_MIXED_SKILL_DOMAIN_ONLY',
      targetSection: recommendation.targetSection,
      targetDomain: recommendation.targetDomain,
      confirmedSkill: null,
      provisionalSkills,
    };
  }

  return noAction('UNRECOGNIZED_RECOMMENDATION_SHAPE');
}
