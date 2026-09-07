# Local Agent 1.2.4: XAMZA time-rejection recovery canary

An allocated receipt rejected by the fiscal device with `9030 - DATETIME_IS_IN_THE_PAST` could block later receipts indefinitely. The Agent now retries the original TXID, requires a fresh explicit provider rejection and complete unchanged fiscal counters, then archives the rejected receipt/TXID before allocating a receipt with corrected time. Payment amounts and line items remain unchanged. Ambiguous responses keep their original unresolved identity. Replacement is bounded to one per call, and a lost allocation response cannot cause another allocation.

Source: `cafe-postcode-local-agent` commit `fd72f43` on `fix/fiscal-time-rejection-124`.

This publication adds only the versioned canary installer. The fleet manifest and existing installers remain 1.2.3 until live canary acceptance. Install over the existing installation without uninstalling or clearing its SQLite/configuration.

- Installer: `CafePostcodeAgentSetup-1.2.4.exe`, 8,543,356 bytes; SHA256 `3556d022686e06b5215c5a22f2f60df6a517726ccb49b7f1e112f6254c10f152`.
- Embedded Agent SHA256: `5e48ef5f1db45804163c01c65c2b339565764856ea115cb6523ea4a18c6d3abc`. Manifest verified with the existing Ed25519 public key. Authenticode remains unsigned, as in 1.2.3.
- All Go packages passed, including ten time-rejection fault cases and existing time-sync recovery tests.
- Real Fiscal Drive Service emulator: old TXID 2 rejected, corrected TXID 4 registered; receipt sequence changed from 1 to 2. Three repeat registrations returned the same fiscal proof without another receipt.
- Exact signed binary passed five Windows process upgrade scenarios from published 1.2.3: success, failed health rollback, updater death before/after admission and installer upgrade. Configuration and unresolved historical evidence were preserved in each case.

At publication XAMZA's live recovery was still pending installation. This document does not claim the branch is fixed or every production branch has been tested. No new production sale or refund is part of the installer.
