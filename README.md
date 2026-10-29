# Explorer

## What should this student do next?

Explorer is a learning decision system, starting with SAT. It uses diagnostic evidence and targeted follow-up evidence to decide whether to stop, investigate further, or authorize a focused teaching target.

This is a **curated YC review snapshot** of three implementation modules from the Alpha backend. The full production repository remains private. This repository is independently initialized with fresh history; it is not a fork or a runnable copy of the application.

## Working Alpha / demo

[Open the staging surface used for the final YC demo](https://sat-prep-platform-git-codex-pre-alpha-student-a65787-iris-d495.vercel.app/). Application access may require an invited account. The public example below runs without application access.

The demo frontend is bound to commit `683f83eff02670a55d732ef3541cc2c9339412fb`; the backend serving that frontend is bound to `c342042c8c07943343aceb3cdc692f79ce5f0a92`. These are distinct deployed versions. The three source modules here are unchanged excerpts from that backend commit. This snapshot does not establish the version of any other staging domain.

## A synthetic decision journey

All examples and tests use invented data. They are demonstrations, not real learner evidence.

1. Insufficient diagnostic evidence → `NO_ACTION`.
2. A single incorrect observation supplies a provisional skill hypothesis → `VERIFY_MORE`, with no confirmed teaching target.
3. A fresh independent incorrect observation for that skill → `TEACH` eligibility. A correct follow-up instead yields mixed evidence → `NO_ACTION`.
4. Teaching release still requires a human decision bound to the exact target and proposed module, version, and content hash. Missing approval or changed content blocks release.

`NO_ACTION` is a bounded stop, not a mastery claim. `TEACH` means evidence authorizes a target, not that teaching has already been released or that learning has occurred.

With Node.js 22.7 or later, run:

```sh
node examples/synthetic-decision-cases.mjs
node --test tests/decision-contract.test.mjs
```

No package installation or credentials are required.

## Implementation

| Module | Responsibility |
| --- | --- |
| [Evidence to action](src/evidenceToActionContract.js) | Maps trusted upstream recommendation objects to `NO_ACTION`, `VERIFY_MORE`, or `TEACH` |
| [Clarifying verification](src/clarifyingVerificationOutcome.js) | Interprets complete follow-up correctness; stops on incomplete, mixed, or multiple supported targets without unique priority |
| [Teaching authorization](src/teachAuthorizationGate.js) | Checks human review against the confirmed target and, when supplied, exact content identity |

See [architecture](docs/architecture.md), [decision boundaries](docs/decision-boundaries.md), and [Alpha scope](docs/alpha-scope.md).

## Scope and limitations

These modules represent a bounded Alpha contract, including Math-oriented evidence-to-action rules. They are not the entire Alpha routing system or a complete SAT assessment. Upstream scoring, evidence validation, independent-item binding, content eligibility, persistence, authentication, and later orchestration are outside this snapshot.

No efficacy, mastery, score improvement, retention, or product-market-fit result is claimed. Synthetic execution does not demonstrate real learner validation. Broader coverage and learner outcomes require separate validation.

## License and trademark

[MIT License](LICENSE); the original copyright and permission notice are preserved. No third-party runtime dependencies are bundled.

SAT® is a registered trademark of College Board. Explorer is not affiliated with, endorsed by, or sponsored by College Board and does not produce official SAT scores.
