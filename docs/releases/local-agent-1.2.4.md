# Local Agent 1.2.4

The public installer and signed mandatory update manifest now select 1.2.4, using the exact executable tested on XAMZA. The source is `cafe-postcode-local-agent` production commit `fd72f43`. Existing versioned installers and executables remain unchanged.

The fix recovers `9030 - DATETIME_IS_IN_THE_PAST` only after retrying the original TXID and observing a fresh explicit device rejection with complete unchanged fiscal counters. It durably archives the rejected TXID, receipt and counter evidence before allocating a corrected-time receipt. Ambiguous errors, changed counters, incomplete proof and lost allocation responses retain their unresolved identity. Each call permits at most one time replacement. No payment amount, item, historic payment ID or cash-shift ID is changed.

## Acceptance

- All Go packages passed. Ten focused rejection/recovery cases include changed/incomplete counters, proxy errors, allocation response loss, persistence failure, SQLite reopen and 9091 synchronization followed by 9030 rejection.
- Real vendor emulator reproduced the rejection; the corrected receipt registered once and three repeats returned the same proof.
- The exact distribution executable passed five Windows process upgrade, rollback, crash and installer scenarios from published 1.2.3. Original configuration, history and unresolved journal evidence survived.
- XAMZA reconnected on 1.2.4. Eight existing payments totaling 185,000 UZS recovered as fiscal receipts 92–98 and 100. Receipt 99 was a separate new POS payment made during recovery, not an audit-created sale. Every recovered payment has a backend `sent` fiscal receipt and original device proof. The original rejected TXID 93 is archived alongside its replacement TXID 94 / receipt 92.
- Eight recovered print documents reached Windows XP-80C with `succeeded`, exactly one attempt each. Paper delivery was not independently observed.
- At 22:58:45 Asia/Tashkent, XAMZA had zero pending/failed backend outbox, zero unknown financial commands, no unresolved fiscal intents and zero OFD pending receipts. All 113 pre-recovery payment rows retained their original identity, order, amount, method, status and creation time. Two new POS sales were added while recovery was in progress.

## Artifacts

| Artifact | Bytes | SHA256 |
|---|---:|---|
| CafePostcodeLocalAgent-1.2.4-windows-amd64.exe | 19,969,536 | 5e48ef5f1db45804163c01c65c2b339565764856ea115cb6523ea4a18c6d3abc |
| CafePostcodeAgentSetup.exe / CafePostcodeAgentSetup-1.2.4.exe | 8,543,356 | 3556d022686e06b5215c5a22f2f60df6a517726ccb49b7f1e112f6254c10f152 |

The public mandatory manifest is signed with the existing Ed25519 trust key and verifies against those exact executable bytes. The versioned canary installer contains its original signed non-mandatory manifest; both manifests authorize the same tested executable. Authenticode remains unsigned as in 1.2.3.

## Remaining operational limitations

Public availability does not establish that every branch has installed this release. Existing 1.2.3 update admission still waits on unresolved work; XAMZA required an installer over its existing installation.

Four older XAMZA `terminal_failed` records remain preserved and were not financially reconciled by this receipt-time fix. The existing shift-close guard includes that state, so shift closure is not certified by this acceptance. No real bank transaction was retried, no unsupported success was fabricated and no database history was cleared.
