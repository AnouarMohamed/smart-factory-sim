# Architecture Deep Dive

This guide expands the high-level [Architecture](../ARCHITECTURE.md) document with implementation boundaries that reviewers can use when evaluating changes.

## Runtime Composition

`SmartFactoryApp` is the browser composition root. It owns the long-lived services and connects them through typed interfaces:

| Runtime Area | Primary Classes | Notes |
|---|---|---|
| Time and loops | `SimulationClock`, `TickScheduler`, `PerformanceProfiler` | Physics, logic, and render loops run at independent frequencies. |
| Factory state | `FactoryWorld`, scenario JSON | Scenario data creates the navigation grid, shelves, conveyors, workers, docks, chargers, and hazards. |
| Robot behavior | `RobotController`, `StateMachine`, `WheelController`, `ServoController` | Robot controllers own private pose, mission, battery, sensors, maintenance, and arm state. |
| Path planning | `AStarPlanner`, `PathSmoother` | Plans are generated from the active navigation grid and smoothed before mission assignment. |
| Digital twin | `DigitalTwin`, `TwinSynchronizer` | Rendering, UI, MQTT, edge, cloud, and replay consume twin snapshots instead of controller internals. |
| Industrial IoT | `MQTTBroker`, `MQTTClient`, `TelemetryEmitter`, `OPCUASimulator`, `EdgeNode`, `CloudConnector` | Telemetry is emitted from twin snapshots and observed by storage, cloud, and dashboard feeds. |
| Rendering | `SceneManager`, `CameraController`, `RobotMesh` | Three.js renders the procedural factory, robot meshes, paths, labels, and camera modes. |
| UI controls | `UIManager` | HUD buttons are stable DOM nodes; render ticks update active state instead of replacing controls. |

## Tick Model

The scheduler emits three channels:

| Channel | Responsibility | Typical Consumers |
|---|---|---|
| Physics | Robot motion, battery drain, sensors, worker movement | `RobotController.step()`, `FactoryWorld.step()` |
| Logic | Fleet metrics, MQTT publications, OPC-UA writes, edge preprocessing | `FleetManager`, `TelemetryEmitter`, `MQTTClient` |
| Render | Three.js mesh updates, camera updates, HUD refresh | `SceneManager`, `UIManager` |

Physics and logic can evolve without coupling to DOM rendering because each loop exchanges immutable snapshots through the digital twin.

## Mission Control Flow

1. The operator selects a car route in the HUD.
2. `UIManager` emits a `set-route` command without changing the active camera POV.
3. `SmartFactoryApp` maps the route key to station coordinates and plans pickup, dropoff, and charger segments.
4. `RobotController.assignMission()` replaces the active mission with those segments.
5. The controller advances through navigation, loading, transport, unloading, charger travel, and charging states.
6. The digital twin snapshot exposes the current state, path, payload, arm angle, wheels, sensors, and battery.
7. `SceneManager` renders per-car path lines and cargo state; `UIManager` renders the selected car or factory overview state.

## Camera Ownership

Only the `Factory`, `robot-1`, and `robot-2` POV controls change `CameraController` mode. Route and speed controls never move the camera.

| UI Control | App Command | Camera Effect |
|---|---|---|
| `Factory` | `overview` | Switch to top-down factory view. |
| `robot-1`, `robot-2` | `select-pov` | Switch to follow camera for the selected car. |
| Route buttons | `set-route` | No camera change. |
| Speed buttons | `set-speed` | No camera change. |

## Hot Reload Safety

The browser entry point disposes the previous app instance before booting a fresh one. Disposal stops the scheduler, releases WebGL resources, removes resize listeners, and removes HUD listeners/styles. This prevents stale render loops from overwriting active controls during Vite hot reloads.

## Extension Rules

- Add new shared contracts under `src/types`.
- Keep robot controller internals private; expose behavior through digital twin snapshots.
- Keep UI commands explicit and typed in `UIManager`.
- Prefer scenario JSON changes for factory layout changes.
- Keep Docker and CI changes documented in `docs/` and `DEVLOG.md`.
