# Decision boundaries

| Evidence / review condition | Bounded result |
| --- | --- |
| Missing recommendation or insufficient evidence | NO_ACTION |
| Trusted same-skill target already established upstream | TEACH eligibility |
| Domain target plus incorrect skill observations | VERIFY_MORE with provisional hypotheses |
| No incorrect skill observations for a domain target | NO_ACTION |
| Missing follow-up correctness for any provisional skill | NO_ACTION: incomplete |
| All follow-ups correct | NO_ACTION: mixed evidence |
| Exactly one follow-up skill converges | TEACH eligibility for that skill |
| Multiple skills converge | NO_ACTION: no unique priority in this module |
| Missing human review or target mismatch | HUMAN_REVIEW_REQUIRED |
| Supplied proposed content differs in ID, version, or hash | HUMAN_REVIEW_REQUIRED |
| Exact matching approval / rejection | APPROVED / REJECTED |

## Input trust and caller obligations

These are internal pure functions, not public-input validators. `deriveAuthorizedAction` trusts the upstream recommendation; it does not independently prove item validity, observation independence, skill taxonomy, inference-level consistency, or scoring. In particular, a supplied skill target is trusted after the insufficient-evidence checks. Do not expose it directly to untrusted client payloads.

`interpretClarifyingOutcome` assumes validated provisional skill identifiers and server-scored, independently bound follow-up evidence. Missing booleans stop the decision. Duplicate or otherwise invalid skill lists must be rejected upstream.

`evaluateTeachAuthorizationGate` assumes evidence validity has already been established. Its review-only mode allows `proposedActivity` to be omitted; that mode does not prove content binding. A release caller must supply a valid proposed activity with nonempty, validated ID/version/hash fields, validate the review record, and separately enforce content eligibility. The module does not validate those field schemas or implement review authentication.

The example's fabricated review and content hash illustrate comparison only; they do not constitute an actual human review or real instructional content.

Multiple supported targets stopping here is the behavior of this excerpted clarifier, not a claim about every later Alpha resolver or routing layer.
