# Local Agent 1.2.1 coordinated release

The POS and admin fiscal retry now use one financial owner: the paired Local Agent persists the original command and device TXID, executes locally, and synchronizes immutable evidence to the backend. Repeated requests recover the original outcome. The backend does not execute fiscal work on a second payment path. Every branch must upgrade; no old financial runtime fallback is part of this release.

## Release set

| Repository | Source commit |
| --- | --- |
| Local Agent | `5fef9f686eb5beef2c37eb2c6f4a33ba88e3a51c` |
| Backend | `73572596fc4288169553ac4dc4f58117c2f9d8be` |
| POS | `fb17569b8a43ee930bce72e8273337b2cc1338e7` |
| Admin | The commit containing this document and the download artifacts |

Agent build timestamp: `2026-09-05T14:33:12Z`. The executable embeds the Agent source commit above. The update manifest has `version: 1.2.1` and `mandatory: true`.

| Artifact in `public/downloads` | Bytes | SHA-256 |
| --- | ---: | --- |
| `CafePostcodeAgentSetup.exe` | 8576841 | `efff74d75a8c9283fd37ecf53dfd8666180fe27ae695ab7bc8b2fc03b46f86a6` |
| `CafePostcodeLocalAgent-1.2.1-windows-amd64.exe` | 19882496 | `e4435bb90b5bdd7bf2643a758ca11126ae67381063a63a10afcbfacb686684f2` |

The copied executable and update manifest passed SHA-256 and Ed25519 verification against the existing embedded public trust key. Trust continuity was also verified against the previously published 1.1.15 release. Windows Authenticode is **NotSigned**, as for that previous release; Ed25519 verification is not an Authenticode signature. The certificate-required CI signing gate remains a separate requirement if used for publication.

## Validation

- Go suite and installer build passed.
- Relevant backend suites: 169 tests passed, followed by 32 passing tests after the final plain-refund print fix; 181 distinct cases across these overlapping suites. Ruff and migration drift checks passed. Earlier 144-test failures were investigated and corrected, including real service-fee freeze persistence and plain-refund print-document defects.
- POS: 163 tests, type checking, changed-file lint and production build passed.
- Admin: 69 relevant tests passed across the main and corrected form-fixture runs; TypeScript, changed-file lint and production build passed.
- Local POS acceptance: 52 sales, 5 full-order refunds, 57 physical fiscal receipts, 6 closed cash/fiscal shifts, 100 applied financial events and 59 fiscal print submissions. All six cash differences and final OFD/outbox/inbox/unknown counts were zero.

The 52 physical cases ran across iterative candidates, not all on this final 1.2.1 executable. Final-candidate offline/split/refund/reconnect across shifts passed. Real bank-terminal transactions and paper output are outside the requested scope; the test fiscal USB and Windows print spool were exercised. This is not a claim of exhaustive production acceptance.

## Production cutover

This commit prepares publication; it does not deploy. Production branches trigger deployment on push, so publication must be a coordinated operation.

1. Back up the production database and each branch's Agent SQLite state, device identity and fiscal history. Preserve these across update; do not reset or delete journals.
2. Pause cashier writes for cutover. Resolve or explicitly archive historical execution requests with an audit record; retain any unknown accounting outcome as unresolved accounting evidence. Empty execution queues alone do not prove balanced accounts or correct fiscal shifts.
3. Deploy the matched backend, including billing migrations 0016–0018 and local_agents 0009, and the POS/admin contract. Publish the mandatory 1.2.1 artifact after the backend can accept its authenticated event protocol. Verify the old writer has stopped before admitting the new owner.
4. Verify one paired owner and `financial_events_v2` capability, physical/recorded shift agreement, no unknown financial outcomes, and drained live outbox/inbox. Offline branches must upgrade and pass these checks on reconnection before cashier access is restored.
5. Complete one controlled branch cycle with this exact artifact: open, cash/split sale, refund, offline/reconnect, close, next shift, and receipt/print reconciliation. Apply the same acceptance gate to the remaining mandatory upgrades.

Historical fixes on September 5 preserved original evidence and did not issue replacement fiscal receipts. OLTIN JO'JA's recovered sales retain their original closed shifts and unchanged original close reports; the recovery audit records post-close cash/card deltas for reconciliation. QAYUMOV's erroneous OFD receipt 135 has not been annulled. FOOD PARK's unidentifiable historical refund requests must not be treated as booked refunds. Physical/backend shift discrepancies and branches that were offline remain branch admission checks. Production data details belong in the restricted audit, not this public source document.
