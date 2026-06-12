# CI Pipeline

The repository uses GitHub Actions to validate the browser simulation, documentation-adjacent changes, and Docker packaging.

## Workflows

| Workflow | File | Runs On | Purpose |
|---|---|---|---|
| CI | [.github/workflows/ci.yml](../.github/workflows/ci.yml) | Pull requests and pushes to `main` | Install dependencies, lint, test, and build the Vite app. |
| Docker | [.github/workflows/docker.yml](../.github/workflows/docker.yml) | Docker/runtime-relevant pull requests and pushes to `main` | Validate Compose config and build the production image. |

## Local Parity

Run these commands before marking a PR ready:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

For Docker changes:

```bash
docker compose config --quiet
docker build -t smart-factory-sim:local .
```

## 10-PR Stack

This Docker, docs, and pipeline upgrade is intentionally split for teammate review:

| Order | Branch | PR Scope |
|---:|---|---|
| 1 | `codex/docs-index` | Documentation index and README link. |
| 2 | `codex/docs-architecture-deep-dive` | Architecture deep dive and system ownership docs. |
| 3 | `codex/docs-operations-runbook` | Runbook and troubleshooting docs. |
| 4 | `codex/docs-team-workflow` | Contributor and team workflow docs. |
| 5 | `codex/docker-runtime` | Production Dockerfile, Nginx config, and Docker context rules. |
| 6 | `codex/docker-compose-docs` | Compose file and Docker docs. |
| 7 | `codex/ci-core-quality` | Core CI quality workflow. |
| 8 | `codex/ci-docker-build` | Docker build workflow. |
| 9 | `codex/ci-pr-hygiene` | Pull request template, CODEOWNERS, and Dependabot. |
| 10 | `codex/docs-ci-pipeline` | Pipeline documentation and stack summary. |

Merge from top to bottom in the table. Each PR targets the branch immediately above it, with the first PR targeting `main`.

## Required Checks

At minimum, PRs should pass:

- CI: lint, tests, and production build.
- Docker: Compose validation and image build when Docker files or app runtime files change.

## Future Pipeline Extensions

- Publish Docker images to GHCR after release naming is agreed.
- Add Playwright browser smoke tests once the dependency is accepted.
- Upload build artifacts for demo previews.
- Add branch protection requiring CI and Docker checks before merge.
