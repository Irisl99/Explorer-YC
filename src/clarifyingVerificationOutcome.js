// Interprets a completed Clarifying (VERIFY_MORE) activity against the provisional skill
// hypotheses that authorized it (evidenceToActionContract.js). Every provisional skill started
// from exactly one incorrect Diagnostic observation -- this function only asks whether the fresh,
// independent clarifying item for that same skill was ALSO wrong (converges) or was correct
// (mixed evidence). It never ranks converged skills against each other and never claims mastery,
// deficiency, or a stable weakness -- it only says whether TEACH is now authorized, for at most
// one skill.

export const CLARIFYING_OUTCOME_REASON = Object.freeze({
  NO_PROVISIONAL_SKILL: 'NO_PROVISIONAL_SKILL',
  EVIDENCE_INCOMPLETE: 'CLARIFYING_EVIDENCE_INCOMPLETE',
  CONVERGED_SINGLE_SKILL: 'CLARIFYING_CONVERGED_SINGLE_SKILL',
  MIXED_NO_CONVERGENCE: 'CLARIFYING_EVIDENCE_MIXED_NO_CONVERGENCE',
  MULTIPLE_SUPPORTED_TARGETS: 'MULTIPLE_SUPPORTED_TARGETS_NO_UNIQUE_PRIORITY',
});

// clarifierCorrectBySkill: { [skill]: boolean } -- server-scored correctness of the fresh
// clarifying item for that skill. A skill missing from this map (not answered, activity abandoned/
// invalidated, or a binding mismatch) is incomplete evidence, not a false/negative signal.
export function interpretClarifyingOutcome(provisionalSkills, clarifierCorrectBySkill) {
  if (!Array.isArray(provisionalSkills) || provisionalSkills.length === 0) {
    return { action: 'NO_ACTION', reasonCode: CLARIFYING_OUTCOME_REASON.NO_PROVISIONAL_SKILL, convergedSkill: null, convergedSkills: [] };
  }
  for (const skill of provisionalSkills) {
    if (typeof clarifierCorrectBySkill?.[skill] !== 'boolean') {
      return { action: 'NO_ACTION', reasonCode: CLARIFYING_OUTCOME_REASON.EVIDENCE_INCOMPLETE, convergedSkill: null, convergedSkills: [] };
    }
  }

  const convergedSkills = provisionalSkills.filter(skill => clarifierCorrectBySkill[skill] === false);

  if (convergedSkills.length === 1) {
    return { action: 'TEACH', reasonCode: CLARIFYING_OUTCOME_REASON.CONVERGED_SINGLE_SKILL, convergedSkill: convergedSkills[0], convergedSkills };
  }
  if (convergedSkills.length === 0) {
    return { action: 'NO_ACTION', reasonCode: CLARIFYING_OUTCOME_REASON.MIXED_NO_CONVERGENCE, convergedSkill: null, convergedSkills: [] };
  }
  // Two (or more) skills each independently converged. Per Founder Decision 5, this is not "no
  // convergence" -- it is convergence without unique priority. Private Alpha fails closed rather
  // than arbitrarily picking one.
  return { action: 'NO_ACTION', reasonCode: CLARIFYING_OUTCOME_REASON.MULTIPLE_SUPPORTED_TARGETS, convergedSkill: null, convergedSkills };
}
