# Operations Runbook

This runbook covers local operation for reviewers, teammates, and demo operators.

## Local Startup

```bash
pnpm install
pnpm dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

## Pre-Demo Checklist

1. Run `pnpm build` to verify TypeScript and production bundling.
2. Run `pnpm test` to verify core simulation behavior.
3. Run `pnpm lint` to verify static checks.
4. Start `pnpm dev`.
5. Hard-refresh the browser if Vite has been hot reloading for a long session.
6. Confirm the top bar shows `Factory`, `robot-1`, and `robot-2`.
7. Click `robot-1`, `robot-2`, then `Factory` and verify the active button changes.
8. Change a route, for example `robot-1` from `A-B` to `A-C`, and verify the camera does not switch.
9. Click `Pause` and verify the clock state changes to `paused`.

## Expected First-Load State

| Area | Expected State |
|---|---|
| Camera | Top-down factory overview. |
| Robot metric | `none` in overview mode. |
| State metric | `OVERVIEW`. |
| Active robots | `2/2` after simulation starts. |
| Default routes | `robot-1: A-B`, `robot-2: C-D`. |
| Scene | Perimeter walls, beams, stations A-D, chargers, docks, obstacles, route lines, and two cars. |

## Control Expectations

| Control | Expected Behavior |
|---|---|
| `Factory` | Returns to overview and sets selected robot to `none`. |
| `robot-1` | Follows the first car. |
| `robot-2` | Follows the second car. |
| Route buttons | Reassign the selected car route without changing the camera. |
| `Pause` | Stops simulated time. Buttons remain clickable. |
| `0.5x`, `1x`, `2x` | Resume and set simulation speed. |

## Release Readiness

Before a release branch or demo tag:

```bash
pnpm lint
pnpm test
pnpm build
```

Review [DEVLOG.md](../DEVLOG.md) and [CHANGELOG.md](../CHANGELOG.md) for missing notes.
