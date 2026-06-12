# Smart Factory Sim

A cinematic industrial control room in the browser, where autonomous logistics robots, MQTT telemetry, workers, shelves, and factory systems run as one virtual digital twin.

![Build](https://img.shields.io/badge/build-passing-00D4FF)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)
![Three.js](https://img.shields.io/badge/Three.js-r160%2B-111827)
![License](https://img.shields.io/badge/license-MIT-00FF88)
![Coverage](https://img.shields.io/badge/tests-core%20covered-FFB300)

## Architecture

```text
RobotController -> DigitalTwin -> MQTTBroker -> TelemetryStore
       |               |              |              |
       v               v              v              v
  StateMachine    SceneManager     MQTTPanel      ReplayRecorder
       |               |              |
       v               v              v
 FactoryWorld -> FleetManager -> UIManager
```

## Features

### Robotics

- Differential-drive robot kinematics with wheel RPM, slip flags, velocity, heading, and path following.
- Typed finite state machine for idle, navigation, blocked, loading, transport, unloading, charging, error, and emergency stop states.
- Battery, maintenance, servo arm, anomaly, and telemetry models.

### Factory

- Scenario-driven shelves, conveyors, loading docks, chargers, workers, hazards, zones, and shifts.
- Worker safety bubbles and autonomous route movement.
- Weighted navigation grid and A* path planning.

### Industrial IoT

- In-browser MQTT broker with subscriptions, wildcard routing, retained messages, QoS metadata, and LWT support.
- Observable digital twin as the authoritative robot state.
- Simulated OPC-UA node tree, edge preprocessing, cloud sink, telemetry store, and replay recorder.

### Visualization

- Three.js factory floor with shelves, conveyors, worker safety zones, robot meshes, sensor cones, path lines, lighting, and ambient particles.
- Dense telemetry dashboard with panels for robot state, sensors, PID, MQTT, fleet, inventory, alerts, cloud, OPC-UA, edge, maintenance, profiler, and replay.

## Quick Start

```bash
pnpm install
pnpm dev
pnpm test
```

Open the Vite URL printed by `pnpm dev`.

## Built-In Scenarios

| Scenario | Demonstrates |
|---|---|
| Small Warehouse | First-load baseline with two robots, shelves, conveyor, docks, workers, and chargers. |
| Large Industrial Facility | Fleet congestion, larger navigation spaces, and mixed task priority. |
| Chaos Stress Test | High pressure routing, blocked cells, dense workers, and failure hooks. |
| Night Shift | Low-light factory operation and critical restocking. |
| Multi-Robot Swarm | Ten-robot coordination and conflict-heavy routing. |

## Tech Stack

| Tool | Version | Rationale |
|---|---:|---|
| TypeScript | 5.3+ | Strict compile-time contracts for simulation state and telemetry. |
| Vite | 5+ | Fast browser development with ESM and simple Three.js integration. |
| Three.js | r160+ | Mature 3D rendering engine for procedural factory and robot visuals. |
| Vitest | 1+ | Fast unit tests for core simulation logic. |
| ESLint | 8+ | Static checks for strict TypeScript and maintainable APIs. |
| pnpm | 9+ | Deterministic installs and workspace support. |

## Project Structure

```text
config/      Typed configs and scenario JSON
firmware/    Virtual Arduino firmware mirror
public/      Vite HTML entry and favicon
src/core/    Event bus, clock, scheduler, replay, logger, profiler
src/physics/ Kinematics, PID, collision, friction, payload math
src/robot/   Robot state, controller, battery, maintenance, telemetry
src/iot/     MQTT, digital twin, OPC-UA, edge, cloud, telemetry store
src/rendering/ Three.js scene, materials, objects, effects
src/ui/      Dashboard panels and controls
tests/       Focused unit tests
```

## Documentation

- [PLAN.md](PLAN.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DIGITAL_TWIN.md](DIGITAL_TWIN.md)
- [MQTT_SPEC.md](MQTT_SPEC.md)
- [PHYSICS.md](PHYSICS.md)
- [FIRMWARE.md](FIRMWARE.md)
- [SCENARIO_GUIDE.md](SCENARIO_GUIDE.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CHANGELOG.md](CHANGELOG.md)
- [DEVLOG.md](DEVLOG.md)

