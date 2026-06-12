# Architecture

## System Diagram

```text
Scenario JSON
    |
    v
FactoryWorld -> NavGrid -> AStarPlanner
    |             |             |
    v             v             v
WorkerAgent   FleetManager -> RobotController
                                  |
                                  v
                           DigitalTwin
                             |   |   |
                             |   |   +-> SceneManager
                             |   +-----> MQTTBroker -> MessageBus -> MQTTPanel
                             +---------> UIManager -> Panels
```

## Data Flow Walkthrough

1. `TickScheduler` emits a physics tick at 100 Hz.
2. `RobotController.step()` integrates wheel motion, samples synthetic sensors, updates battery and maintenance state, and returns a `RobotDigitalTwin`.
3. `TwinSynchronizer` writes the snapshot into `DigitalTwin`.
4. Logic ticks publish robot telemetry and battery state through `MQTTBroker`.
5. `TelemetryStore`, `MessageBus`, `CloudConnector`, and `ReplayRecorder` observe MQTT messages.
6. Render ticks read `DigitalTwin` snapshots and update `SceneManager` meshes.
7. `UIManager` refreshes dashboard panels from the same digital twin and broker-derived feeds.

## Module Responsibilities

| Module | Responsibility |
|---|---|
| `core` | Time, ticks, events, logging, replay, config, and performance metrics. |
| `physics` | Vector math, differential drive, PID, collision, friction, and payload dynamics. |
| `pathfinding` | Occupancy grid, weighted A*, dynamic replanning, deadlock detection, and heatmap accumulation. |
| `robot` | Robot state machine, motion command generation, battery, servo, maintenance, anomaly, and telemetry. |
| `sensors` | Virtual ultrasonic, IR, IMU, encoder, noise, fusion, and failure injection behavior. |
| `factory` | Scenario world, shelves, conveyors, docks, chargers, workers, inventory, zones, hazards, and shifts. |
| `iot` | MQTT broker/client, retained messages, LWT, digital twin, OPC-UA nodes, edge, cloud, and telemetry storage. |
| `fleet` | Task queue, assignment, conflict detection, route reservations, and fleet KPIs. |
| `rendering` | Three.js scene, factory meshes, robot meshes, camera, lighting, materials, visualizations, and effects. |
| `ui` | Dashboard panels, controls, HUD state, and scenario editor model. |
| `export` | Telemetry, MQTT log, mission report, and capture exports. |

## Why Digital Twin

The digital twin is the authoritative state boundary. It prevents renderers, panels, MQTT publishers, and replay tools from reading private robot controller internals. This allows the robot simulation to evolve while downstream consumers keep a stable data contract.

## Why EventBus

`EventBus` provides typed event contracts for cross-domain notifications such as state changes, battery warnings, MQTT messages, hazards, fleet conflicts, and UI alerts. It reduces direct runtime coupling and makes event payloads compile-time checked.

## Trade-Offs

- The first build uses a coherent vertical slice with typed extension points instead of full industrial fidelity in every module.
- MQTT and OPC-UA are semantic simulations, not network protocol implementations.
- Procedural geometry is used instead of external 3D model assets to keep first load fast and reproducible.
- The UI refreshes panel regions instead of framework components to keep dependencies minimal.

