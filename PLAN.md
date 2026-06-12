# Smart Factory Logistics Robot Simulation Platform - Plan

## 1. Project Mission Statement

Smart Factory Sim is a browser-native industrial IoT digital twin for autonomous factory logistics robots. It models robot motion, sensors, fleet coordination, factory workers, inventory, MQTT messaging, OPC-UA style machine telemetry, and a Three.js control-room view as one coherent virtual system. The platform exists to make robotics, controls, fleet behavior, and industrial telemetry inspectable without physical hardware.

## 2. Full Repository Tree

```text
smart-factory-sim/
├── PLAN.md                          # Master architectural blueprint and build constitution.
├── DEVLOG.md                        # Running build journal for architectural decisions and deviations.
├── README.md                        # Product overview, quickstart, architecture summary, and documentation index.
├── ARCHITECTURE.md                  # Deep system architecture, module responsibilities, and data flow.
├── DIGITAL_TWIN.md                  # Digital Twin pattern explanation and implementation notes.
├── MQTT_SPEC.md                     # Complete simulated MQTT topic and payload specification.
├── PHYSICS.md                       # Kinematics, PID control, wheel slip, and payload dynamics.
├── FIRMWARE.md                      # Virtual Arduino firmware mirror documentation.
├── SCENARIO_GUIDE.md                # Built-in scenario behavior and scenario editor guide.
├── CONTRIBUTING.md                  # Code standards, architecture rules, and contribution workflow.
├── CHANGELOG.md                     # Semantic versioned feature history.
├── LICENSE                          # MIT License.
├── package.json                     # pnpm project scripts, package metadata, and dependencies.
├── pnpm-workspace.yaml              # pnpm workspace package list.
├── tsconfig.json                    # Strict TypeScript base config.
├── tsconfig.paths.json              # TypeScript path aliases for major source domains.
├── vite.config.ts                   # Vite build and test configuration with aliases.
├── .eslintrc.json                   # Strict ESLint configuration for TypeScript.
├── .prettierrc                      # Prettier formatting policy.
├── .gitignore                       # Ignored build artifacts, dependencies, caches, and logs.
├── config/
│   ├── factory.config.ts            # Typed factory layout defaults and physical zone constants.
│   ├── robot.config.ts              # Typed robot geometry, mass, motor, battery, and sensor constants.
│   ├── simulation.config.ts         # Tick rates, physics constants, time scale, and performance limits.
│   ├── mqtt.config.ts               # Broker namespace, topic helper functions, QoS, and retention defaults.
│   ├── fleet.config.ts              # Fleet size, assignment weights, task queue, and conflict constants.
│   └── scenarios/
│       ├── small-warehouse.json     # Scenario 1: compact 20x20 warehouse baseline.
│       ├── large-warehouse.json     # Scenario 2: large 60x60 facility for fleet coordination.
│       ├── chaos-stress.json        # Scenario 3: high density stress test with failures.
│       ├── night-shift.json         # Scenario 4: low-light critical delivery operation.
│       └── multi-swarm.json         # Scenario 5: 10-robot coordinated swarm.
├── src/
│   ├── main.ts                      # Browser entry point.
│   ├── app.ts                       # Root application class that composes systems.
│   ├── types/
│   │   ├── index.ts                 # Re-exports all shared types.
│   │   ├── robot.types.ts           # Robot state, pose, telemetry, task, payload, and alert interfaces.
│   │   ├── factory.types.ts         # Grid, shelf, zone, conveyor, dock, worker, and hazard interfaces.
│   │   ├── sensor.types.ts          # Sensor readings, failure modes, and sensor metadata.
│   │   ├── mqtt.types.ts            # MQTT topics, payloads, QoS, subscriptions, and client interfaces.
│   │   ├── physics.types.ts         # Vector, pose, kinematic, PID, and wheel state interfaces.
│   │   ├── fleet.types.ts           # Fleet task, assignment, reservation, conflict, and metrics interfaces.
│   │   ├── simulation.types.ts      # Tick events, scenario schema, replay frames, and app events.
│   │   └── ui.types.ts              # Panel, control, alert, HUD, chart, and notification interfaces.
│   ├── core/
│   │   ├── EventBus.ts              # Typed zero-dependency pub/sub event system.
│   │   ├── SimulationClock.ts       # Master simulation clock with deterministic time scaling.
│   │   ├── TickScheduler.ts         # Independent physics, logic, and render tick scheduler.
│   │   ├── ReplayRecorder.ts        # Structured simulation event recorder.
│   │   ├── ReplayPlayer.ts          # Replay playback and scrubber service.
│   │   ├── ConfigManager.ts         # Typed runtime config registry.
│   │   ├── Logger.ts                # Structured logger with severity levels.
│   │   └── PerformanceProfiler.ts   # Tick, render, memory, pathfinding, and MQTT metric collector.
│   ├── physics/
│   │   ├── DifferentialDrive.ts     # Differential drive kinematics, motor limits, and slip model.
│   │   ├── PIDController.ts         # Discrete PID with anti-windup, derivative filter, and term telemetry.
│   │   ├── KinematicSolver.ts       # Forward and inverse motion helper functions.
│   │   ├── CollisionDetector.ts     # AABB, swept circle, and proximity collision checks.
│   │   ├── FrictionModel.ts         # Floor friction and wheel slip calculations.
│   │   ├── PayloadDynamics.ts       # Payload center-of-gravity and tipping risk calculations.
│   │   └── Vector.ts                # Immutable Vector2 and Vector3 math primitives.
│   ├── pathfinding/
│   │   ├── NavGrid.ts               # Occupancy grid with weighted cells and reservations.
│   │   ├── AStarPlanner.ts          # Weighted A* with octile heuristic and expansion tracing.
│   │   ├── DynamicReplanner.ts      # Obstacle watcher and replan trigger.
│   │   ├── PathSmoother.ts          # Catmull-Rom inspired path smoothing helpers.
│   │   ├── DeadlockResolver.ts      # Circular wait detector and route release helper.
│   │   └── HeatmapAccumulator.ts    # Robot path density accumulator for floor heatmaps.
│   ├── robot/
│   │   ├── RobotController.ts       # Robot orchestrator for state, sensors, actuators, path following, and twin sync.
│   │   ├── StateMachine.ts          # Typed finite state machine with transition validation.
│   │   ├── RobotStates.ts           # State definitions and valid transition map.
│   │   ├── WheelController.ts       # Wheel RPM, torque, slip, and encoder coordination.
│   │   ├── ServoController.ts       # Forklift arm PWM to angle simulation.
│   │   ├── BatteryModel.ts          # Battery discharge, charge, health, and cycle model.
│   │   ├── MaintenanceTracker.ts    # Motor hours, lift cycles, bearing wear, and maintenance alerts.
│   │   ├── AnomalyDetector.ts       # Rolling baseline and anomaly classification.
│   │   └── TelemetryEmitter.ts      # MQTT telemetry payload builder.
│   ├── sensors/
│   │   ├── UltrasonicSensor.ts      # HC-SR04 cone, raycast, range, blind spot, and noise simulation.
│   │   ├── IRSensorArray.ts         # 5-channel reflectance sensor and line error calculation.
│   │   ├── IMUSensor.ts             # Accelerometer and gyroscope simulation with drift.
│   │   ├── WheelEncoder.ts          # Quadrature encoder tick simulation.
│   │   ├── SensorFusion.ts          # Encoder and IMU pose estimator.
│   │   ├── SensorNoiseModel.ts      # Gaussian noise, dropout, drift, and freeze helpers.
│   │   └── SensorFailureInjector.ts # Failure state injector for sensor modules.
│   ├── factory/
│   │   ├── FactoryWorld.ts          # Factory world aggregate for grid, shelves, workers, docks, conveyors, hazards, and shifts.
│   │   ├── FactoryGrid.ts           # Tile occupancy, zones, and entity metadata.
│   │   ├── ShelfSystem.ts           # Shelf inventory and pick points.
│   │   ├── ConveyorBelt.ts          # Animated conveyor state and crate movement.
│   │   ├── LoadingDock.ts           # Dock queue and handoff simulation.
│   │   ├── ChargingStation.ts       # Charging bay state and queue logic.
│   │   ├── WorkerAgent.ts           # Worker routes, shift state, and safety bubble behavior.
│   │   ├── WorkerSpawner.ts         # Worker lifecycle by shift density.
│   │   ├── InventorySystem.ts       # Global stock levels and reorder triggers.
│   │   ├── ZoneManager.ts           # Restricted zones and priority corridors.
│   │   ├── HazardSystem.ts          # Hazards, wet floor zones, and blocked areas.
│   │   └── ShiftScheduler.ts        # Three-shift production and worker density scheduler.
│   ├── fleet/
│   │   ├── FleetManager.ts          # Central robot fleet orchestrator.
│   │   ├── TaskQueue.ts             # Priority queue for fleet tasks.
│   │   ├── TaskAssigner.ts          # Robot assignment by distance, battery, and task priority.
│   │   ├── ConflictResolver.ts      # Junction conflict and right-of-way resolver.
│   │   ├── FleetRouter.ts           # Fleet route reservation coordinator.
│   │   └── FleetTelemetry.ts        # Fleet KPI aggregator.
│   ├── iot/
│   │   ├── MQTTBroker.ts            # In-browser MQTT broker with topics, retain, QoS metadata, and LWT.
│   │   ├── MQTTClient.ts            # Simulated MQTT client API.
│   │   ├── TopicRouter.ts           # Wildcard topic matching and retained message lookup.
│   │   ├── LastWillManager.ts       # LWT registration and delivery manager.
│   │   ├── MessageBus.ts            # MQTT message feed model.
│   │   ├── DigitalTwin.ts           # Observable authoritative robot state.
│   │   ├── TwinSynchronizer.ts      # Robot controller to digital twin synchronizer.
│   │   ├── OPCUASimulator.ts        # Simplified OPC-UA node tree.
│   │   ├── EdgeNode.ts              # Edge preprocessing pipeline.
│   │   ├── CloudConnector.ts        # Simulated cloud telemetry sink.
│   │   └── TelemetryStore.ts        # Queryable time-series store.
│   ├── rendering/
│   │   ├── SceneManager.ts          # Three.js scene, renderer, camera, and object lifecycle.
│   │   ├── CameraController.ts      # Orbit, follow, top-down, and free camera modes.
│   │   ├── LightingSystem.ts        # Ambient, sun, and factory light management.
│   │   ├── DayNightCycle.ts         # Time-of-day light and sky color model.
│   │   ├── PostProcessing.ts        # Bloom, SSAO hooks, depth of field hooks, film grain, and vignette plan.
│   │   ├── materials/
│   │   │   ├── FloorMaterial.ts     # Procedural floor material helpers.
│   │   │   ├── MetalMaterial.ts     # Brushed metal and robot chassis material helpers.
│   │   │   ├── HazardMaterial.ts    # Warning stripe material helpers.
│   │   │   └── HologramMaterial.ts  # Digital twin wireframe material helpers.
│   │   ├── objects/
│   │   │   ├── RobotMesh.ts         # Robot mesh with chassis, wheels, fork, sensors, LED, and overlays.
│   │   │   ├── WheelMesh.ts         # Wheel geometry and rotation helper.
│   │   │   ├── ForkliftArmMesh.ts   # Forklift arm geometry and servo angle updates.
│   │   │   ├── ShelfMesh.ts         # Shelf geometry and inventory fill visualization.
│   │   │   ├── CrateMesh.ts         # Cargo crate geometry and label placeholder.
│   │   │   ├── ConveyorMesh.ts      # Conveyor geometry and belt animation.
│   │   │   ├── WorkerMesh.ts        # Worker marker mesh and walking animation.
│   │   │   ├── SensorVisualization.ts # Sensor cone, IR dots, and raycast line rendering.
│   │   │   ├── PathVisualization.ts # Current path, waypoints, and frontier trace rendering.
│   │   │   ├── HeatmapVisualization.ts # Floor heatmap overlay.
│   │   │   └── DigitalTwinOverlay.ts # Holographic twin overlay.
│   │   └── effects/
│   │       ├── ParticleSystem.ts    # Lightweight particle pool for alerts and motion dust.
│   │       ├── AlertEffect.ts       # Pulsing incident ring effect.
│   │       ├── TrailEffect.ts       # Robot motion trail.
│   │       └── AmbientParticles.ts  # Factory air dust effect.
│   ├── ui/
│   │   ├── UIManager.ts             # DOM panel layout and UI state coordinator.
│   │   ├── HUDLayer.ts              # HUD overlay model and render helpers.
│   │   ├── panels/
│   │   │   ├── TelemetryPanel.ts    # Battery, speed, heading, ETA, and payload telemetry.
│   │   │   ├── StateMachinePanel.ts # State transition visualization.
│   │   │   ├── SensorPanel.ts       # Real-time sensor readings and waveforms.
│   │   │   ├── MQTTPanel.ts         # Live MQTT message feed and topic filter.
│   │   │   ├── PIDPanel.ts          # Four-channel PID oscilloscope.
│   │   │   ├── FleetPanel.ts        # Fleet overview, robot statuses, and active tasks.
│   │   │   ├── InventoryPanel.ts    # Shelf stock levels by zone.
│   │   │   ├── AlertPanel.ts        # Incident, anomaly, and error log.
│   │   │   ├── CloudPanel.ts        # Simulated cloud telemetry panel.
│   │   │   ├── OPCUAPanel.ts        # OPC-UA node tree browser.
│   │   │   ├── EdgeNodePanel.ts     # Edge preprocessing pipeline visualization.
│   │   │   ├── MaintenancePanel.ts  # Wear levels and predicted maintenance.
│   │   │   ├── ProfilerPanel.ts     # FPS, tick time, pathfinding, memory, and MQTT throughput.
│   │   │   └── ReplayPanel.ts       # Replay controls and scrubber.
│   │   ├── controls/
│   │   │   ├── ControlPanel.ts      # Manual override, emergency stop, speed, and servo controls.
│   │   │   ├── WaypointEditor.ts    # Waypoint placement and ordering model.
│   │   │   ├── PIDTuner.ts          # Live Kp, Ki, Kd control model.
│   │   │   ├── FailureInjector.ts   # Sensor, power, WiFi, motor, path, and worker failure commands.
│   │   │   ├── ScenarioSelector.ts  # Built-in scenario selection.
│   │   │   ├── TimeControl.ts       # Pause, play, time scale, and time-of-day controls.
│   │   │   └── CameraControls.ts    # Camera mode selection.
│   │   └── ScenarioEditor.ts        # 2D scenario authoring model and validation.
│   └── export/
│       ├── TelemetryExporter.ts     # JSON telemetry export.
│       ├── MQTTLogExporter.ts       # CSV MQTT export.
│       ├── MissionReportGenerator.ts # Printable mission report generator.
│       └── GIFCapture.ts            # Animated capture placeholder.
├── firmware/
│   ├── README.md                    # Firmware mirror overview.
│   ├── robot_main/
│   │   ├── robot_main.ino.ts        # Arduino setup and loop mirror.
│   │   ├── state_machine.cpp.ts     # Firmware state machine mirror.
│   │   └── config.h.ts              # Hardware pin and timing constants.
│   ├── sensors/
│   │   ├── ultrasonic.cpp.ts        # HC-SR04 driver mirror.
│   │   ├── ir_array.cpp.ts          # IR array driver mirror.
│   │   └── wheel_encoder.cpp.ts     # Encoder interrupt mirror.
│   ├── actuators/
│   │   ├── motor_driver.cpp.ts      # L298N motor driver mirror.
│   │   ├── servo_controller.cpp.ts  # Servo PWM mirror.
│   │   └── pid_controller.cpp.ts    # Firmware PID mirror.
│   └── communication/
│       ├── wifi_manager.cpp.ts      # ESP8266 WiFi mirror.
│       ├── mqtt_client.cpp.ts       # PubSubClient MQTT mirror.
│       └── telemetry.cpp.ts         # Firmware telemetry packet builder.
├── tests/
│   ├── core/
│   │   ├── EventBus.test.ts         # EventBus compile-time and runtime behavior tests.
│   │   ├── SimulationClock.test.ts  # Clock pause, scale, and tick behavior tests.
│   │   └── ConfigManager.test.ts    # Config registry tests.
│   ├── physics/
│   │   ├── DifferentialDrive.test.ts # Differential drive kinematics tests.
│   │   ├── PIDController.test.ts    # PID output, anti-windup, and reset tests.
│   │   └── CollisionDetector.test.ts # Collision geometry tests.
│   ├── pathfinding/
│   │   ├── AStarPlanner.test.ts     # Path planning and blocked-cell tests.
│   │   └── DeadlockResolver.test.ts # Circular wait and release tests.
│   ├── robot/
│   │   ├── StateMachine.test.ts     # Valid and invalid transition tests.
│   │   └── BatteryModel.test.ts     # Battery discharge and charge tests.
│   ├── iot/
│   │   ├── MQTTBroker.test.ts       # Publish, subscribe, retain, and wildcard tests.
│   │   ├── DigitalTwin.test.ts      # Twin update and observer tests.
│   │   └── TopicRouter.test.ts      # MQTT wildcard matching tests.
│   └── fleet/
│       ├── TaskQueue.test.ts        # Priority ordering tests.
│       └── ConflictResolver.test.ts # Right-of-way tests.
└── public/
    ├── index.html                   # Static fallback HTML for the Vite app shell.
    ├── favicon.svg                  # Factory robot icon.
    └── fonts/                       # Reserved self-hosted font directory.
```

## 3. Technology Stack Justification

| Tool | Role | Rationale |
|---|---|---|
| Browser runtime | Delivery target | Keeps the simulation entirely virtual and easy to run without services. |
| TypeScript 5.3+ | Language | Strict typing keeps robotics state, telemetry, and protocols auditable. |
| Vite 5+ | Build tool | Fast dev loop, native ESM, simple Three.js support, and Vitest integration. |
| Three.js r160+ | 3D engine | Mature low-level rendering control for factory scenes and robot meshes. |
| pnpm | Package manager | Deterministic installs and workspace-friendly structure. |
| Vitest | Tests | Fast TypeScript unit testing for core, physics, pathfinding, IoT, and fleet logic. |
| ESLint + typescript-eslint | Static analysis | Enforces zero loose typing, explicit APIs, and maintainable module boundaries. |
| Prettier | Formatting | Removes style churn from engineering reviews. |
| In-browser MQTT simulation | IoT layer | Demonstrates broker semantics without external network or hardware dependencies. |
| DOM + canvas overlays | UI layer | Keeps the dashboard dense, inspectable, and independent of the Three.js scene graph. |

## 4. Module Dependency Graph

```text
config -> types
types -> core
core -> physics
core -> pathfinding
core -> robot
core -> sensors
core -> factory
core -> iot
core -> fleet
core -> rendering
core -> ui

physics -> robot
physics -> sensors
physics -> factory
physics -> pathfinding

pathfinding -> robot
pathfinding -> fleet
pathfinding -> factory

robot -> iot
robot -> fleet
robot -> rendering
robot -> ui

factory -> pathfinding
factory -> fleet
factory -> rendering
factory -> ui

iot -> ui
iot -> export

fleet -> iot
fleet -> ui
fleet -> rendering

rendering -> ui

app -> config
app -> core
app -> physics
app -> pathfinding
app -> robot
app -> sensors
app -> factory
app -> iot
app -> fleet
app -> rendering
app -> ui
app -> export
```

Logic modules communicate operational events through `EventBus`. Imports are allowed for shared types and construction-time composition. Runtime data movement uses typed events and digital twin snapshots instead of direct cross-module mutation.

## 5. Data Flow Architecture

```text
RobotController logic tick
  -> StateMachine transition
  -> DifferentialDrive and sensor updates
  -> TwinSynchronizer writes DigitalTwin
  -> DigitalTwin emits typed property events
  -> MQTTBroker publishes retained telemetry/state messages
  -> TelemetryStore records time-series frame
  -> SceneManager reads latest twin snapshot for 3D transforms
  -> UIManager updates panels, MQTT feed, profiler, alerts, and oscilloscope
  -> ReplayRecorder captures event and twin frame
```

The `DigitalTwin` is the authoritative state boundary. Robot controllers write to it; renderers and panels read from it; MQTT messages mirror it; replays serialize it.

## 6. Simulation Tick Architecture

| Loop | Frequency | Responsibility |
|---|---:|---|
| Physics | 100 Hz, 10 ms fixed step | Kinematics, wheel slip, collision, encoder, IMU, high-rate sensors. |
| Logic | 20 Hz, 50 ms fixed step | State machine, path decisions, fleet coordination, MQTT publish cadence. |
| Render | RequestAnimationFrame, target 60 Hz | Three.js render, DOM panels, particles, camera, path animations. |

`SimulationClock` owns scaled simulated time. `TickScheduler` accumulates wall-clock delta, runs up to five physics catch-up steps per render frame, then emits `simulation:tick` events with the current tick channel and time.

## 7. Three.js Scene Graph Plan

```text
Scene
├── AmbientLight
├── DirectionalLight
├── FactoryGroup
│   ├── FloorGroup
│   │   ├── FloorMesh
│   │   ├── HeatmapMesh
│   │   └── LineMarkings
│   ├── ShelvingGroup
│   ├── ConveyorGroup
│   ├── LightingGroup
│   ├── WorkerGroup
│   └── HazardGroup
├── RobotGroup:{robotId}
│   ├── ChassisGroup
│   │   ├── BodyMesh
│   │   ├── SensorMountMesh
│   │   ├── StatusLED
│   │   └── Headlights
│   ├── WheelGroup
│   │   ├── FrontLeftWheel
│   │   ├── FrontRightWheel
│   │   ├── RearLeftWheel
│   │   └── RearRightWheel
│   ├── ForkliftArmGroup
│   │   ├── ArmBaseMesh
│   │   ├── LiftMesh
│   │   └── ForkMesh
│   ├── SensorVisualizationGroup
│   │   ├── UltrasonicConeMesh
│   │   ├── IRDotGroup
│   │   └── RaycastLines
│   ├── PathVisualizationGroup
│   │   ├── CurrentPathLine
│   │   ├── WaypointMarkers
│   │   └── AStarFrontierMesh
│   └── DigitalTwinOverlayGroup
│       ├── HologramChassisWireframe
│       └── HologramDataLines
├── UIGroup
└── PostProcessingPass
```

The first implementation builds stable geometry and update hooks for all major groups. Advanced shader, particle, and post-processing details can deepen after the core state path is verified.

## 8. MQTT Topic Tree

```text
factory/
├── robots/{robotId}/telemetry        QoS 0 retained true  10 Hz
├── robots/{robotId}/state            QoS 1 retained true  on change
├── robots/{robotId}/sensors/ultrasonic QoS 0 retained false 20 Hz
├── robots/{robotId}/sensors/ir_array QoS 0 retained false 50 Hz
├── robots/{robotId}/sensors/encoder  QoS 0 retained false 100 Hz
├── robots/{robotId}/sensors/imu      QoS 0 retained false 100 Hz
├── robots/{robotId}/actuators/motors QoS 0 retained false on command
├── robots/{robotId}/actuators/servo  QoS 0 retained false on command
├── robots/{robotId}/battery          QoS 0 retained true  1 Hz
├── robots/{robotId}/maintenance      QoS 0 retained false 0.1 Hz
├── robots/{robotId}/anomaly          QoS 2 retained false on event
├── robots/{robotId}/lwt              QoS 1 retained true  on unclean disconnect
├── fleet/tasks/queue                 QoS 1 retained true  on change
├── fleet/tasks/active                QoS 1 retained true  on change
├── fleet/tasks/completed             QoS 1 retained false on complete
├── fleet/conflicts                   QoS 2 retained false on event
├── fleet/metrics                     QoS 0 retained true  1 Hz
├── factory/workers/{workerId}/position QoS 0 retained false 5 Hz
├── factory/inventory/{shelfId}       QoS 1 retained true  on change
├── factory/conveyors/{conveyorId}/state QoS 0 retained true on change
├── factory/hazards                   QoS 2 retained true  on change
├── system/clock                      QoS 0 retained true  1 Hz
├── system/scenario                   QoS 1 retained true  on load
└── system/health                     QoS 0 retained true  1 Hz
```

Payload schemas are defined in `src/types/mqtt.types.ts` and documented in `MQTT_SPEC.md`.

## 9. State Machine Specification

### States

| State | Meaning |
|---|---|
| IDLE | Robot is online and waiting for task assignment. |
| INITIALIZING | Robot is performing boot, sensor, MQTT, and safety checks. |
| NAVIGATING | Robot is following a planned path to a target. |
| OBSTACLE_BLOCKED | Robot stopped due to a worker, obstacle, hazard, or blocked reserved cell. |
| LOADING | Forklift arm is collecting payload from a shelf or conveyor handoff. |
| TRANSPORTING | Robot is carrying payload to a dock or destination. |
| UNLOADING | Forklift arm is delivering payload at a dock. |
| CHARGING | Robot is docked or queued at a charging station. |
| ERROR | Recoverable fault requires reset or maintenance action. |
| EMERGENCY_STOP | Safety stop locks motion until operator reset. |

### Valid Transitions

```text
IDLE -> INITIALIZING, NAVIGATING, CHARGING, ERROR, EMERGENCY_STOP
INITIALIZING -> IDLE, ERROR, EMERGENCY_STOP
NAVIGATING -> OBSTACLE_BLOCKED, LOADING, TRANSPORTING, CHARGING, IDLE, ERROR, EMERGENCY_STOP
OBSTACLE_BLOCKED -> NAVIGATING, ERROR, EMERGENCY_STOP
LOADING -> TRANSPORTING, ERROR, EMERGENCY_STOP
TRANSPORTING -> OBSTACLE_BLOCKED, UNLOADING, CHARGING, ERROR, EMERGENCY_STOP
UNLOADING -> IDLE, NAVIGATING, ERROR, EMERGENCY_STOP
CHARGING -> IDLE, ERROR, EMERGENCY_STOP
ERROR -> INITIALIZING, CHARGING, EMERGENCY_STOP
EMERGENCY_STOP -> INITIALIZING
```

Triggers include task assignment, boot completion, route arrival, obstacle detection, replan success, payload state changes, charge thresholds, failure injection, anomaly escalation, and operator reset.

## 10. Build Milestones

1. Create `PLAN.md` first.
2. Scaffold package, TypeScript, Vite, lint, format, and path aliases.
3. Create all shared types in `src/types`.
4. Build core EventBus, clock, scheduler, logger, profiler, config, and replay services.
5. Build physics vector, differential drive, PID, collision, friction, payload dynamics, and solver modules.
6. Build nav grid and A* planner.
7. Build robot state machine and robot controller path-following loop.
8. Build sensor simulations and failure injection.
9. Build factory world, workers, shelves, conveyors, docks, chargers, inventory, zones, hazards, and shifts.
10. Build MQTT broker, clients, router, digital twin, OPC-UA, edge, cloud, and telemetry store.
11. Build fleet manager, task queue, assignment, route reservations, conflicts, and metrics.
12. Build Three.js scene, factory geometry, robot geometry, visualizations, effects, lighting, and cameras.
13. Build UI panels, controls, scenario selector, failure injector, PID tuner, and scenario editor model.
14. Build export utilities.
15. Build firmware mirror files.
16. Add focused tests for core, physics, pathfinding, robot, IoT, and fleet.
17. Add all five scenario JSON files.
18. Complete all required documentation.
19. Wire `src/app.ts` and `src/main.ts`.
20. Verify `pnpm build`, `pnpm test`, and `pnpm lint`.

## 11. Known Constraints and Design Trade-offs

| Constraint | Decision | Trade-off |
|---|---|---|
| Entirely virtual | No real MQTT, hardware, or cloud calls. | Real integration adapters are out of scope for the browser build. |
| Browser-only runtime | MQTT, OPC-UA, and cloud systems are simulations. | Protocol semantics are modeled, not wire-compatible network services. |
| Performance target | Use data snapshots and minimal DOM updates. | Some panels show summarized windows instead of every raw sample. |
| Three.js first load | Build procedural meshes instead of external model assets. | Visual fidelity comes from geometry, materials, lighting, and motion rather than imported CAD. |
| Strict TypeScript | Shared interfaces live in `src/types`. | More up-front type work, less ambiguity later. |
| Event-driven modules | Use EventBus and DigitalTwin as runtime boundaries. | Event chains require profiler and logger support to trace. |
| Prompt requires exact tree | Avoid extra repository root files unless a tool makes them unavoidable. | Product/design skill context is derived from the prompt instead of adding `PRODUCT.md`. |
| Initial build scope | Implement coherent vertical slice plus typed placeholders for all required modules. | Advanced shader and export polish can iterate after the first build passes. |

