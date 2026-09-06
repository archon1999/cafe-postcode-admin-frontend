# Agent 1.2.3 — shift close recovery

A failed fiscal close could leave the cash shift permanently closing, block new orders, and produce ten unknown journal records for one physical request. The failure was reproduced on both 1.2.1 and 1.2.2 source baselines.

Undispatched closes and durable explicit 9091 rejections now atomically preserve the rejected fiscal intent and reopen the cashier shift. A fresh close can be started after connectivity returns. An ambiguous dispatched close remains protected and only recovers from original device/Z evidence; it is never blindly sent again.

Repeated request IDs with the same actor, terminal and business payload link to the original durable close. Lookup and retries resolve that original command. Completing it also links older identical, explicitly shift-bound unknown requests while retaining their payloads and prior responses. Different cash counts or shift identities cannot replace the original request. Closing-shift lookup accepts an omitted current shift ID and never substitutes a different shift for an explicit missing ID. Known admission rejections no longer inflate the unknown-command count.

The authenticated Agent command channel adds `agent.financial.inspect` (bounded read-only journal evidence) and `agent.financial.resume` (original stored command only). Neither accepts SQL, filesystem paths, replacement amounts or replacement actors. Existing actor authorization and immutable payload checks remain mandatory.

Validation covers six fault scenarios, real TCP response loss, original-command recovery after SQLite reopen, duplicate requests, changed amounts, missing shift IDs, old duplicate reconciliation, atomic rollback on storage failure, and diagnostic authorization/payload restrictions. These tests simulate devices and do not claim BOHRAM's original unknown operations have been resolved. Published executable upgrade acceptance and rollout evidence are recorded separately.

No backend/POS protocol migration, branch-history deletion, bank transaction, or fiscal re-registration is required. The POS card hotfix remains c1749f8. Publish a new immutable signed version; retain earlier versioned binaries and upgrade existing installations without uninstalling/resetting their data.

Release validation on 2026-09-06: all Go packages passed. The final signed executable was tested against the published 1.2.1 and 1.2.2 executables in five upgrade/rollback/crash/installer scenarios each. Existing configuration, financial history, ten unknown command payloads/hashes/responses and the original unresolved fiscal intent were preserved.

Compiled source: `75621d5`. Final executable SHA-256: `a21d3f6b395043c565e1fe6699a38a8784e35fbde3a8e30d4f789e00fbbbc2be` (19,961,856 bytes). The manifest signature was verified against the existing updater trust key. Real branch recovery must be verified separately after installation.
