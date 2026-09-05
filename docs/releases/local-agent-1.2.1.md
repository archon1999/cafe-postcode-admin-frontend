# Local Agent 1.2.1 coordinated release

Financial execution belongs to one paired Local Agent per branch, online and offline. It persists the command identity and fiscal TXID before device work, retains the original outcome and synchronizes immutable evidence to the backend. Every branch must upgrade; the release does not add an older financial runtime fallback.

## Release set

| Repository | Source commit |
| --- | --- |
| Local Agent | `e62a04cf302dbde8151e9d231ee8e75bc3c21300` |
| Backend | `73572596fc4288169553ac4dc4f58117c2f9d8be` |
| POS | `d6c7239070572ebe264928d92cf4a8a24aa159d7` |
| Admin | The commit containing this document and these artifacts |

Agent build timestamp: `2026-09-05T16:52:43Z`. Embedded Git revision matches the committed clean source. Manifest version is **1.2.1**, **mandatory=true**.

| Artifact in `public/downloads` | Bytes | SHA-256 |
| --- | ---: | --- |
| `CafePostcodeAgentSetup.exe` | 8530472 | `23c947d9d6b3c796821fc2b7628815354e7e1a83426c78604e3ba3e50665716d` |
| `CafePostcodeLocalAgent-1.2.1-windows-amd64.exe` | 19919360 | `7d3ce465537056e887d25fd7e784b15760886175d44bcec25eb6e82066b88506` |
| `local-agent-release.json` | 435 | `78694b2866889f26a7f09cd41901fdce2507aae74c87c61958654f9c69940b3c` |

SHA-256 and Ed25519 verification passed with the existing embedded trust key, including trust continuity with published 1.1.15. Windows Authenticode is **NotSigned**, as in the previous package; a certificate-required publication pipeline still requires its organization's certificate.

## History preservation

The updater and installer over an existing installation share signed release admission. They stop the existing owner, block watchdog restarts, take a consistent SQLite snapshot and save the config in a protected `update-backup-*` directory beside the config. The candidate migrates and answers preflight health while POS, sync, financial/device and print workers remain gated. POS explains the brief update and retains any original pending command ID.

A preflight failure restores the executable and matching database together. Once business work is admitted, no database snapshot rollback is allowed because it could lose new sales. An interrupted updater finishes forward with the verified candidate. Original device binding, local journal, resolved historical evidence, fiscal-service data and Windows spool are retained. Download cleanup cannot remove the installation or history backups. Never use uninstall/reset/delete-state as the branch upgrade procedure.

## Validation

- Complete Go suite and installer build passed.
- The exact signed release EXE passed five Windows process scenarios starting from the actually published 1.1.15 EXE: successful upgrade, health failure after schema 7 migration, updater exit after replacement, updater exit after commit, and installer upgrade. Old history, resolved-request evidence and byte-identical config survived each scenario. Additional fault tests cover damaged backups, no rollback after admission, fresh snapshots after interrupted rollback, cleanup and watchdog locks.
- Production PostgreSQL backup was restored to an isolated local clone and billing 0016–0018 / local_agents 0009 applied. 86 original tables / 584,112 rows were compared. All business history was unchanged; the only differences were new permission/content-type metadata and permission/role update timestamps. No existing row was deleted.
- Backend: 181 distinct relevant tests across overlapping 169- and 32-case runs; Ruff and migration drift checks passed.
- POS: 432 distinct tests passed across the complete suite and corrected 9-case characterization rerun; TypeScript, changed-file lint and production build passed.
- Admin: 69 relevant tests; TypeScript, changed-file lint and production build passed.
- Prior iterative physical POS acceptance: 52 sales, 5 full-order refunds, 6 closed cash/fiscal shifts and 59 fiscal print submissions. All final cash/OFD/sync discrepancies were zero. Those 52 cases were spread across iterative candidates.
- **Exact signed 1.2.1 acceptance:** 3 sales, one full split-payment fiscal refund, 2 closed cash/fiscal shifts, 13 applied financial events and 4 fiscal spool submissions. Covered double-click, reload, precheck, invalid split, backend outage, Agent restart, offline close/open successor and reconnect. Both cash differences and final OFD/outbox/inbox/unknown counts were zero. Original 89 payments, 17 refund rows, 15 shifts, 164 immutable events and the preceding physical Z-report were preserved.

Real bank terminals and physical paper output were excluded as requested. The test fiscal USB and Windows spool were used; the normal local Agent/task/watchdog and isolated fixture routes were restored afterward.

## Production cutover

This release is ready for a coordinated, staged production deployment. It is not deployed by this commit. Production-branch pushes trigger deployment: publish deliberately in the order below.

1. Inventory every branch, including offline devices. Schedule a cashier pause. Take a fresh production DB backup immediately before cutover and verify it; preserve Agent state, config/device identity and fiscal-service data. The completed restore rehearsal proves the backup procedure, but its earlier dump is not a current cutover snapshot.
2. Deploy backend `73572596fc4288169553ac4dc4f58117c2f9d8be` first. Its deploy workflow runs billing 0016–0018 and local_agents 0009 before replacing services. Verify migrated schema and healthy web/WS/workers. Do not restore the old database after admitting new business writes.
3. Deploy POS `d6c7239070572ebe264928d92cf4a8a24aa159d7`, then the admin release containing this manifest and installer. Verify the published manifest/EXE hash against this document. The update is mandatory; finish the first controlled branch before expanding the same release to every branch.
4. Upgrade through the signed updater or the bundled installer in the existing installation account. Check exactly one paired owner, version 1.2.1, `financial_events_v2`, preflight completed, preserved identity/history and available backup. If preflight fails, its automatic rollback restores both schema and executable; investigate the stored failure before retrying. After admission, recovery is forward with original command IDs.
5. Before reopening each cashier, verify physical/recorded shift agreement, no unknown financial outcome, applied live financial events, and acknowledged OFD/accepted print work. Validate one controlled open → cash/split sale → refund → reconnect → close/next-shift cycle with the exact published artifact. The local exact-artifact cycle passed; production device/network acceptance remains part of deployment itself.
6. Upgrade and check offline branches on reconnection before reopening cashier access. Keep financial/OFD mistakes in audited reconciliation; an execution queue dismissal does not cancel an OFD receipt or create a refund. Never replay an unknown financial operation with a new ID.

Known historical accounting evidence and live branch device/network exceptions are recorded in the restricted audit. Empty backend execution-failure counts do not establish that every fiscal device, printer and historical account is reconciled.
