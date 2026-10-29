# Architecture

```text
Trusted scored diagnostic recommendation
  → deriveAuthorizedAction
    → NO_ACTION: stop this bounded decision
    → VERIFY_MORE: provisional skill hypotheses
      → trusted, independently bound follow-up correctness
      → interpretClarifyingOutcome
    → TEACH: confirmed target
      → caller normalizes action shape
      → evaluateTeachAuthorizationGate
      → exact human approval + separately eligible content
      → downstream learning flow (outside this snapshot)
```

The three excerpted modules have no imports, external dependencies, database access, network access, or randomness. Minimum source dependency set: these three files only. Node.js runs the synthetic demonstration and tests.

The action contract returns `authorizedAction` and `confirmedSkill`. The clarifier returns `action` and `convergedSkill`. The caller must normalize these to `{ action, confirmedSkill }` before consulting the teaching gate. The example makes that adapter explicit.

Teaching eligibility and content release are separate decisions. Content availability does not change the evidence contract. Approval must bind the intended target and proposed content identity; content eligibility and delivery are not implemented here.

Source provenance: unchanged backend excerpts at `c342042c8c07943343aceb3cdc692f79ce5f0a92`. The demo frontend uses `683f83eff02670a55d732ef3541cc2c9339412fb`. No original repository history is included.
