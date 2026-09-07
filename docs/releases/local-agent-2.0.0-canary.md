# Local Agent 2.0.0 canary

POS business shifts close independently of fiscal Z reports. A durable fiscal job retains its original cash desk and fiscal session, stores a successful report in the backend, and leaves failures available for explicit recovery. A prepared or refused close cannot block later receipts; an ambiguous physical dispatch still requires reconciliation.

The existing Admin diagnostics panel and the Agent CLI expose 55 typed support commands with durable request identities, requesting-actor audit, recovery and replay. Remote mutations follow the deployment's existing recent-MFA policy. Go Mono is the only printer font.

Only `downloads/canary/2.0.0/` is added. The global stable manifest and installer remain 1.2.4. Enroll Qamish UUID `bf4e5bb4-fc17-486a-b332-f67fc75af5f0` through the backend canary allowlist after deployment and hosting verification. Publication alone does not enroll a restaurant.

Accepted runtime/package source: `d1dd5e55045085db2e012b1e3ca71f326cd2cb0c`. Release branch `21e134873e6e7485e18e00bf3112960a2e28f5ca` differs only in two documentation files and the published-upgrade test's 1.2.4 fixture support; runtime and packaging source are identical. The exact previously accepted signed distribution bytes are retained.

- EXE: 17,077,760 bytes; SHA256 `aa59bd1d503c6596d50505b1d0f7bf0f9bf8b660ae247c0d67451434a596dba5`.
- Signed gzip transport: 7,147,144 bytes; SHA256 `f66067caddbb77d183127dbf370fec385ed11f0a0022d5c0575da0689778c24c`.
- Installer: 7,258,681 bytes. Ed25519 manifest signatures are verified; Authenticode is not configured.

Exact published 1.2.1 and 1.2.4 upgrades passed real Windows success, failed-health rollback, interruption after replacement, interruption after commit, and installer-upgrade history/config checks. Local acceptance covered UI recovery, cash/card/split/refund, backend-offline sale and reconciliation, fiscal-service outage with independent close/open, old-Z replay against a newer session, two independent POS concurrent payment, and Admin command execution/replay. Production Qamish and physical paper acceptance remain to be completed before stable promotion.

Gzip transport reduces downloads for clients that support it. Legacy clients may use the compatible raw EXE on their first upgrade to 2.0.0.
