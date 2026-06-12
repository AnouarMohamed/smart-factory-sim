# Team Workflow

This project uses small PRs for reviewable changes. Larger efforts should be split by concern and documented in each PR body.

## Branch Naming

Use descriptive branch names:

```text
codex/docs-index
codex/docker-runtime
codex/ci-core-quality
```

## Stacked PRs

When a change naturally depends on an earlier PR, create a stack:

```text
main
  -> codex/docs-index
    -> codex/docs-architecture-deep-dive
      -> codex/docs-operations-runbook
```

Each PR should target the branch immediately below it in the stack. Merge from the bottom up.

## Review Rules

- Keep PRs scoped to one concern.
- Include docs for behavior, runtime, Docker, CI, or workflow changes.
- Include screenshots or demo media when the UI changes.
- Include test evidence in the PR body.
- Prefer draft PRs while a stack is being assembled.

## Local Validation

Run the full local gate before marking a PR ready:

```bash
pnpm lint
pnpm test
pnpm build
```

For Docker changes:

```bash
docker build -t smart-factory-sim:local .
docker run --rm -p 8080:8080 smart-factory-sim:local
```

For Compose changes:

```bash
docker compose up --build
```

## Merge Order

1. Documentation foundation.
2. Architecture and operational docs.
3. Docker runtime files.
4. CI workflows.
5. PR templates and final pipeline docs.

If a later PR needs to change an earlier decision, update the earlier branch when possible and rebase the rest of the stack.
