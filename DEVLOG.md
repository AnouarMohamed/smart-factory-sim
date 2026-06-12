# Development Log

## [BUILD-001] - Initial Architecture Constitution
**Date:** 2026-06-12T15:52:45+01:00
**Decision:** Generate `PLAN.md` as the first repository file and use it as the project constitution.
**Rationale:** The platform has many interacting robotics, IoT, rendering, and UI systems. A written architecture prevents module drift and documents the intended boundaries before implementation starts.
**Trade-off:** The initial plan is intentionally broad. Implementation may start with a vertical slice while preserving the planned tree.
**Files affected:** `PLAN.md`

## [BUILD-002] - Browser-Only Vite Root Strategy
**Date:** 2026-06-12T15:52:45+01:00
**Decision:** Configure Vite to use `public/index.html` as the application entry instead of adding a root-level `index.html`.
**Rationale:** The prompt mandates an exact repository tree with `public/index.html`. Vite can serve that file by setting `root` to `public` and allowing imports from the repository source tree.
**Trade-off:** The source module path in the HTML uses `../src/main.ts`. This is less common than a root `index.html`, but it preserves the requested tree.
**Files affected:** `vite.config.ts`, `public/index.html`

## [BUILD-003] - Typed Vertical Slice First
**Date:** 2026-06-12T15:52:45+01:00
**Decision:** Implement a coherent simulation vertical slice and typed placeholders for all required modules in the first build.
**Rationale:** A fully detailed industrial platform is large. A first build must compile, render, simulate robot motion, publish MQTT telemetry, update the digital twin, and expose panels while keeping every planned module present and documented.
**Trade-off:** Some advanced modules begin with simplified deterministic behavior and extension hooks. This keeps the repository runnable while retaining the architecture needed for later fidelity.
**Files affected:** `src/`, `config/`, `tests/`, `firmware/`, documentation

## [BUILD-004] - Pathfinding Alias Added
**Date:** 2026-06-12T15:52:45+01:00
**Decision:** Add `@pathfinding` to TypeScript and Vite aliases.
**Rationale:** Pathfinding is a first-class source domain in the repository tree. A dedicated alias keeps imports consistent with the other domain modules.
**Trade-off:** The original alias list omitted `@pathfinding`. This is a small documented deviation that improves maintainability.
**Files affected:** `tsconfig.json`, `tsconfig.paths.json`, `vite.config.ts`

## [BUILD-005] - Fleet Alias Added
**Date:** 2026-06-12T15:52:45+01:00
**Decision:** Add `@fleet` to TypeScript and Vite aliases.
**Rationale:** Fleet orchestration is also a first-class source domain and is consumed by app wiring, UI, and tests.
**Trade-off:** This follows the same documented alias expansion as pathfinding.
**Files affected:** `tsconfig.json`, `tsconfig.paths.json`, `vite.config.ts`

## [BUILD-006] - Public Root Source Alias
**Date:** 2026-06-12T15:52:45+01:00
**Decision:** Add a Vite-only `/src` alias to the repository source directory.
**Rationale:** The repository keeps `public/index.html` as required, while Vite dev mode resolves root-relative HTML module scripts inside the configured `public` root. The alias lets `/src/main.ts` resolve correctly without adding an extra root `index.html`.
**Trade-off:** This is a Vite-specific serving detail. TypeScript source imports still use the documented domain aliases.
**Files affected:** `vite.config.ts`, `public/index.html`

## [BUILD-007] - Simulation-First UX Repair
**Date:** 2026-06-12T16:37:14+01:00
**Decision:** Replace the two-rail dashboard with a full-screen simulation HUD, rescale and re-axis the robot mesh, switch the default camera to follow mode, and add explicit visible obstacle, charger, and dock markers.
**Rationale:** The first implementation technically rendered, but the robot was too small, obstacles were not legible, and the UI overwhelmed the simulation. The first screen must communicate a live logistics simulation immediately.
**Trade-off:** Fewer panels are visible by default. Deep telemetry still exists in the codebase, but the first-load surface now prioritizes operational clarity.
**Files affected:** `src/ui/UIManager.ts`, `src/rendering/CameraController.ts`, `src/rendering/SceneManager.ts`, `src/rendering/objects/RobotMesh.ts`, `src/rendering/objects/WheelMesh.ts`, `src/rendering/objects/ForkliftArmMesh.ts`, `src/rendering/objects/SensorVisualization.ts`, `config/scenarios/small-warehouse.json`

## [BUILD-008] - Factory Control and Mission Cycle
**Date:** 2026-06-12T17:00:54+01:00
**Decision:** Add a recognizable full factory floor with perimeter walls, overhead beams, stations A/B/C/D, merchandise crate stacks, route controls per car, POV switching, per-car path colors, and a visible mission cycle: pickup, load, transport, unload, charger, charge.
**Rationale:** A simulation user must immediately understand the factory layout and control both cars. The visual model now shows the facility, the station names, merchandise movement, and operator-configurable routes.
**Trade-off:** This build introduced a deterministic timeout fallback for readability; BUILD-010 removes it because it made long routes visibly skip.
**Files affected:** `src/app.ts`, `src/ui/UIManager.ts`, `src/robot/RobotController.ts`, `src/rendering/SceneManager.ts`, `src/rendering/objects/RobotMesh.ts`, `src/rendering/objects/PathVisualization.ts`, `config/scenarios/small-warehouse.json`

## [BUILD-009] - Factory Overview Polish and Operator Documentation
**Date:** 2026-06-12T17:06:46+01:00
**Decision:** Start the app in factory overview, move station labels onto the floor, align station coordinates with route endpoints, add simulation speed controls, and animate front-wheel steering through heading changes.
**Rationale:** The first-load view should read as an entire factory before the operator chooses a car POV. Floor labels avoid blocking cars, and steering wheels make turns more legible.
**Trade-off:** The factory labels are procedural canvas textures instead of reusable asset files, keeping the scene self-contained while limiting typographic customization.
**Files affected:** `README.md`, `ARCHITECTURE.md`, `DEVLOG.md`, `src/app.ts`, `src/ui/UIManager.ts`, `src/rendering/CameraController.ts`, `src/rendering/SceneManager.ts`, `src/rendering/objects/RobotMesh.ts`, `src/rendering/objects/WheelMesh.ts`

## [BUILD-010] - Stable Operator Controls
**Date:** 2026-06-12T22:44:35+01:00
**Decision:** Remove mission timer snapping, keep route buttons independent from camera POV, and render command results immediately so controls respond even while paused.
**Rationale:** Operators need explicit control. A route assignment should not switch the view, and cars should never jump to stations because a demo timer expired.
**Trade-off:** Long factory routes now take real simulated travel time. This is slower than the previous demo shortcut but makes the simulation believable and debuggable.
**Files affected:** `README.md`, `ARCHITECTURE.md`, `DEVLOG.md`, `src/app.ts`, `src/robot/RobotController.ts`, `src/ui/UIManager.ts`, `tests/robot/RobotController.test.ts`

## [BUILD-011] - Non-Detaching HUD Buttons
**Date:** 2026-06-12T22:56:53+01:00
**Decision:** Keep POV, route, and speed buttons mounted across render ticks, update only their active attributes/classes, and add app disposal plus root replacement for Vite hot reloads.
**Rationale:** Replacing button DOM every telemetry refresh can detach a button while a click is in progress. Hot reloads can also leave old app loops rendering stale HUD state. Both behaviors make controls feel broken.
**Trade-off:** `UIManager` now has more explicit DOM synchronization code instead of simple full-panel `innerHTML` replacement, but interactive controls are stable and testable.
**Files affected:** `ARCHITECTURE.md`, `DEVLOG.md`, `src/main.ts`, `src/app.ts`, `src/rendering/SceneManager.ts`, `src/ui/UIManager.ts`

## [BUILD-012] - README Demo Media Capture
**Date:** 2026-06-13T00:35:21+01:00
**Decision:** Add generated screenshots and a short WebM control walkthrough to `docs/media`, then surface every asset from the README.
**Rationale:** The project needs visual proof of the factory overview, robot POVs, route controls, pause state, mobile layout, and operator workflow without requiring a local run.
**Trade-off:** Binary media increases repository size, but the captured assets make the simulation state and controls reviewable directly from GitHub.
**Files affected:** `README.md`, `DEVLOG.md`, `docs/media/`
