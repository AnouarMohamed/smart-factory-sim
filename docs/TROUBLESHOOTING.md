# Troubleshooting

## Buttons Do Not Respond

1. Hard-refresh the browser to clear old Vite hot-reload state.
2. Confirm the current branch includes the non-detaching HUD button fix.
3. Check the browser console for runtime errors.
4. Verify `#scene-root canvas` has `pointer-events: none` and HUD buttons are visible above the canvas.
5. Restart `pnpm dev` if a stale local dev server was running before a branch switch.

## The Factory Canvas Is Blank

1. Confirm the browser supports WebGL.
2. Check the console for Three.js renderer errors.
3. Run `pnpm build` to catch TypeScript or bundling problems.
4. Confirm the scenario file exists: `config/scenarios/small-warehouse.json`.

## Cars Appear To Jump

1. Confirm the branch includes the stable controls fix that removed mission timer snapping.
2. Check simulation speed. `2x` is intentionally faster.
3. Use `Pause` and `1x` to return to normal timing.

## Docker Container Does Not Serve The App

1. Build the image again with no cache if dependencies changed.
2. Confirm the container maps port `8080` to the host.
3. Check the container logs for Nginx startup errors.
4. Run `pnpm build` locally to make sure `dist/` can be generated outside Docker.

## CI Fails On Install

1. Confirm `pnpm-lock.yaml` was committed.
2. Check the workflow uses the same major pnpm version as `package.json`.
3. Re-run locally with `pnpm install --frozen-lockfile`.

## CI Fails On Build

1. Run `pnpm build` locally.
2. If the failure is chunk-size only, it is a warning unless the workflow explicitly treats it as an error.
3. Inspect changed TypeScript imports and path aliases first.
