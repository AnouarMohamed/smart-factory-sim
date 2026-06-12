# Contributing

## Requirements

- Use pnpm.
- Keep TypeScript strict.
- Do not introduce `any`.
- Add or update tests for changed behavior.
- Update `DEVLOG.md` for significant architecture decisions.
- Update docs when behavior, topics, scenarios, or public APIs change.

## Commands

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
```

## Architecture Rules

- Shared interfaces live in `src/types`.
- Runtime notifications go through `EventBus`.
- The digital twin is the state boundary for rendering, UI, MQTT, replay, edge, and cloud.
- Keep physics constants in `config`.
- Keep rendering procedural unless a committed asset pipeline is added.

## Pull Request Checklist

- Build passes.
- Tests pass.
- Relevant docs are updated.
- `DEVLOG.md` includes architectural decisions or deviations.
- The first-load scenario still renders and runs.

