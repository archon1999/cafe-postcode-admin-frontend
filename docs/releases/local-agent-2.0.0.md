# Local Agent 2.0.0

POS business shifts now close and reopen independently of fiscal Z reports. A fiscal close records its original physical session, retries that operation only, and saves confirmed Z evidence after recovery. A failed Z does not reopen or block the POS shift. Existing order and accounting checks remain.

The existing Admin diagnostics and local CLI expose 55 typed commands for runtime, storage, autostart, services, readers, fiscal receipts/Z/OFD, printers, sync, original-operation recovery, pairing, support and updates. Commands preserve their request ID, original financial evidence and operator audit; arbitrary shell/SQL execution is not exposed.

Go Mono is the only print font. The accepted EXE is 17,079,296 bytes; the signed gzip download is 7,147,923 bytes (58.15% less transfer), and the installer is 7,262,387 bytes. Agents 2.0.0 use the signed gzip transport with resumable Range downloads. Legacy clients use the smaller raw EXE on their first upgrade. Versioned old files and the previous canary remain immutable.

EXE and gzip are hosted as separate byte representations. Automatic HTTP gzip was removed after public CDN testing exposed invalid raw Range offsets despite correct origin behavior. The raw URL includes its content hash to separate it from that cached representation; the underlying EXE, gzip and accepted installer bytes are unchanged. The published manifest re-signs this URL. The installer's embedded manifest remains a valid local signature for the identical EXE.

The final package also restores the established kiosk user's ownership when an elevated Windows process created database or support files with Administrators ownership. Personal ownership, protected user/SYSTEM access and existing data remain preserved.

## Provenance

- Agent source: `209857ae97cf72c6b957774511070712e384602b`.
- EXE SHA256: `4ced641b3861a1f823843181878e643656ceced85ac8390368047b2e5efc3cee`.
- Gzip SHA256: `3c7dbcc8561dd88d20208453a28945688c27869615a05538b3954be32e1b3960`.
- Installer SHA256: `33996a4ec1c6910524d2307e4e97461798e83747a9f4ec86c7f6ab634108ece1`.
- Raw v1 and gzip Ed25519 manifest signatures verified; Windows Authenticode is not configured.

## Validation and limits

Full Go release gate passed. Exact final bytes passed published 1.2.1 and 1.2.4 upgrade, rollback, updater crash and installer history scenarios. Qamish installed the final installer; config and all original journal records were preserved, SQLite quick_check passed, and restricted-token read/write access passed after the ownership correction. Production Admin context refresh and replay retained the same successful command and authenticated actor.

Local multi-POS online/offline and physical Qamish CASH/CARD/SPLIT/refund, fiscal outage, backend outage, shift/Z recovery and completed-old-Z replay passed on the preceding canary. The final source change affects Windows file protection only; financial runtime logic is identical. Qamish ended with no pending/failed/unknown sync commands or pending OFD receipts.

Qamish physical paper output is still unverified: the Windows USB queue reports WorkOffline with older queued jobs. Its configured MARTA endpoint is unreachable. These hardware findings are retained and are not evidence of 100% fleet health. Fleet rollout and branch-specific recovery are tracked separately from software package acceptance.
