# Digital Twin

## Definition

A digital twin is an authoritative virtual representation of a physical or simulated asset. In this platform, each robot twin contains pose, velocity, wheels, mission state, payload, sensors, power, maintenance, anomalies, and alerts.

## Implementation

`src/iot/DigitalTwin.ts` stores `RobotDigitalTwin` snapshots by robot id. `TwinSynchronizer` writes snapshots from `RobotController`. The twin emits typed update events through `EventBus` and is read by rendering, UI, MQTT, replay, edge, and cloud modules.

```text
RobotController -> TwinSynchronizer -> DigitalTwin
                                      |       |
                                      v       v
                                SceneManager MQTTBroker
                                      |       |
                                      v       v
                                  UIManager TelemetryStore
```

## Observer Pattern

The digital twin emits `robot:twin-updated` whenever a snapshot is replaced. Consumers do not mutate the robot. They observe the twin or pull snapshots through `allRobots()` and `getRobot()`.

## Scaling Toward Real Deployment

The same boundary can accept real robot telemetry later. A hardware adapter would translate real MQTT, serial, or cloud messages into the same `RobotDigitalTwin` structure. Renderers and panels would not need to know whether the source is virtual or physical.

## Industry Comparison

AWS IoT TwinMaker and Siemens MindSphere use the same core pattern: asset state is modeled independently from visualization and analytics consumers. This repository mirrors that architecture in-browser so the pattern is visible without cloud infrastructure.

