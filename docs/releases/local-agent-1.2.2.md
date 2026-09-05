# Local Agent1.2.2 release acceptance

The LUMEN failure was a lifecycle mismatch: deleting the last submitted item closed the backend session, but the Agent accepted a subsequent order against that closed session. Cancellation, session closure, floor occupancy, durable kitchen documents and the outbox now commit atomically. New orders reject closed/merged sessions and duplicate active orders. Matching POS returns to halls after submitted cancellation and when a reconciled closed session no longer exists in the active projection. Draft removal retains the current session.

One paired Agent owns financial commands online and offline. All branches upgrade to this mandatory release. This change adds no alternative financial writer for old versions. Original operation IDs, fiscal proof, rejected headers, SQLite history, binding and configuration remain intact. Missing order/session errors are no longer silently classified as completed on restart. Missing fiscal configuration is an actionable warning; an unknown device result remains unknown.

## Exact release set

- Compiled Agent source: `d4bffa5dbb0e8bf2615ecdb8068375fe16a028b6` (clean source at build).
- Matching POS: `18abb7a1f24a04ea1e9fb1ba667623463e5d34d7`.
- Backend runtime is unchanged; regression commit `958fa69b1347b45af42e613f2a90cb001182595b` tests the existing HTTP replay behavior. No new database migration.
- Manifest1.2.2, mandatory=true, existing Ed25519 trust key. Published1.2.1 versioned bytes remain available and unchanged.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `CafePostcodeLocalAgent-1.2.2-windows-amd64.exe` | 19921920 | `eb180b9a8bf7ffae3bf84fb025d385467cfdf16359f07ba632b060c8980608a6` |
| `CafePostcodeAgentSetup.exe` | 8586735 | `5ad9bc205be4c26b3827b92b0f42f271fd9d7f13fc18795f59595ab4415fc2ae` |
| `local-agent-release.json` | 435 | `2a1b75702bc5d500545b1c3bab16b6082af5bbc29b417be43a6733ce25bbe705` |

## Verified acceptance

- Exact signed1.2.2 executable:50 real test-USB fiscal sales,450000UZS, receipt sequences243–292,25 with local backend online and25 while verified local Daphne8000 was stopped. Ten flow configurations each exercised quantities1–5: hall/takeaway, reload, precheck/repeated precheck, double click, zero amount rejection and mixed menu items.
- All50 payments and fiscal receipts matched exactly once after reconnect. All50 fiscal print documents were submitted to Windows POS-80 USB spool. Final outbox, unknown commands, unapplied inbox and OFD pending count were0. Fiscal cash total matched450000UZS; card accumulator did not change.
- Offline shift close produced the physical Z-report, then the next cash shift opened offline. Reconnect preserved its original ID and drained153 queued mutations; successor cash shift also closed. Older164 immutable financial events remained byte-identical. Original physical Z-report/history and test-device counters were preserved.
- Published1.2.1 and1.1.15 executables each passed five process upgrade cases with this exact signed artifact: success, failed preflight/migration rollback, updater death after replacement, updater death after admission, and installer upgrade. History/configuration preserved. These are upgrade tests, not support for a second old financial runtime.
- Actual POS online/offline LUMEN cancellation, successor payment, draft deletion/reload, stale editor/catalog links and printer submission passed. Agent Go packages pass; backend16 HTTP/PostgreSQL regressions pass; POS42 focused tests, TypeScript, lint, production build and PWA acceptance pass.
- One test-harness assertion used stale last-successful backend status immediately after the verified server stop. Original receipt268 was retained and finished without another fiscal request; a read-only backend/port check proved the order was offline. Another harness expected a note field omitted from the active shift DTO; checking the captured original shift ID verified identity.

No real bank/MARTA transaction or physical paper printing was tested. Windows spool acceptance was requested. Authenticode remains NotSigned as in1.2.1; Ed25519 and SHA256 were verified. Tests do not establish every offline branch or external printer/OFD connection is healthy.

## Operational exceptions and rollout

Latest pre-release production inspection:40activeAgents,10online,all10on1.2.1with pending/failed0. GULXONA8 and BOHRAM3 OFD receipts still await network acknowledgment. KAMOLOT/MAFIA active printer routes need verified hardware/configuration access.30offline branches remain unknown; original evidence is required for historical blocked operations. No blind fiscal resend or invented financial adjustment is authorized by this release.

Deploy matching POS and this signed package, then verify canary identity/version and queues before requesting the remaining mandatory upgrades. Preserve existing owner/state, use updater/installer admission and its backups, never uninstall/reset history. Recover forward after admitting new business writes. Publication and fresh fleet acceptance must be recorded separately from this build/test report.
