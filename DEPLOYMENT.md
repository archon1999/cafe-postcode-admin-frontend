# Admin Frontend Deployment

## Release policy

Pushes and pull requests targeting `develop` or `production` run verification only. A production release is intentionally manual:

1. Run the `Admin Frontend CI/CD` workflow from the protected `production` branch.
2. Set `deploy_production` to `true`.
3. Approve the protected GitHub `production` environment.

The workflow builds one OCI image, generates provenance and an SBOM, scans it, smoke-tests the published digest, signs that digest with GitHub OIDC, and deploys the same digest. The production host never rebuilds the frontend.

Required GitHub production secrets:

- `HOST`, `PORT`, `USERNAME`, `SSH_KEY`, `HOST_FINGERPRINT`
- `GHCR_USERNAME`, `GHCR_TOKEN` with pull access to the repository image

The production host must have Docker Compose v2 and Cosign installed. The repository at `/home/postcode/admin-frontend` must be clean; the workflow checks out the exact verified commit in detached mode and fails closed otherwise.

## Build-time public configuration

Vite values are public client configuration, not secrets. Their canonical production values live in the workflow and Dockerfile so CI and the published image are deterministic:

- API origin: `https://cafe-postcode.uz`
- pairing host: `admin.cafe-postcode.uz`
- Agent installer: `/downloads/CafePostcodeAgentSetup.exe`
- MXIK API: `https://tasnif.soliq.uz/api/cls-api`

Changing one of these values requires a reviewed source change and a new signed image. Server-side `.env.production` does not alter an already-built bundle.

## Host configuration and rollback

`/home/postcode/admin-frontend/.env.production` is still required by Compose and should contain only host runtime values, for example:

```dotenv
ADMIN_FRONTEND_PORT=4200
```

The service binds to `127.0.0.1`; TLS terminates at the trusted edge proxy. When a previous healthy container exists, the workflow records its revision, image, and Compose definition under `/home/postcode/backups/deploy`; a failed switch triggers a fail-closed rollback whose container health and image identity are verified.

Do not deploy with `docker compose up --build`; that bypasses the verified immutable artifact.
