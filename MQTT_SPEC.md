# MQTT Specification

## Topic Tree

```text
factory/
├── robots/{robotId}/telemetry
├── robots/{robotId}/state
├── robots/{robotId}/sensors/ultrasonic
├── robots/{robotId}/sensors/ir_array
├── robots/{robotId}/sensors/encoder
├── robots/{robotId}/sensors/imu
├── robots/{robotId}/actuators/motors
├── robots/{robotId}/actuators/servo
├── robots/{robotId}/battery
├── robots/{robotId}/maintenance
├── robots/{robotId}/anomaly
├── robots/{robotId}/lwt
├── fleet/tasks/queue
├── fleet/tasks/active
├── fleet/tasks/completed
├── fleet/conflicts
├── fleet/metrics
├── factory/workers/{workerId}/position
├── factory/inventory/{shelfId}
├── factory/conveyors/{conveyorId}/state
├── factory/hazards
├── system/clock
├── system/scenario
└── system/health
```

## Topic Policies

| Topic | Payload | QoS | Retained | Frequency | Publisher | Subscribers |
|---|---|---:|---|---|---|---|
| `factory/robots/{robotId}/telemetry` | `RobotTelemetry` | 0 | true | 10 Hz target | `TelemetryEmitter` | UI, store, cloud |
| `factory/robots/{robotId}/state` | `RobotState` | 1 | true | on change | `StateMachine` | UI, store |
| `factory/robots/{robotId}/sensors/ultrasonic` | `UltrasonicReading` | 0 | false | 20 Hz | `UltrasonicSensor` | UI, anomaly |
| `factory/robots/{robotId}/sensors/ir_array` | `IRSensorArrayReading` | 0 | false | 50 Hz | `IRSensorArray` | PID, UI |
| `factory/robots/{robotId}/sensors/encoder` | `EncoderReading` | 0 | false | 100 Hz | `WheelEncoder` | fusion, UI |
| `factory/robots/{robotId}/sensors/imu` | `IMUReading` | 0 | false | 100 Hz | `IMUSensor` | fusion, anomaly |
| `factory/robots/{robotId}/battery` | `BatteryPayload` | 0 | true | 1 Hz | `BatteryModel` | UI, fleet |
| `factory/robots/{robotId}/anomaly` | `Alert` | 2 | false | on event | `AnomalyDetector` | alerts, cloud |
| `factory/robots/{robotId}/lwt` | `{ status, lastSeen }` | 1 | true | on unclean disconnect | `LastWillManager` | system health |
| `factory/fleet/metrics` | `FleetMetricsPayload` | 0 | true | 1 Hz | `FleetTelemetry` | UI, cloud |
| `factory/system/health` | `SystemHealthPayload` | 0 | true | 1 Hz | `PerformanceProfiler` | UI |

## Example Payloads

```json
{
  "robotId": "robot-1",
  "timestamp": 12000,
  "pose": { "x": 5.4, "y": 8.2, "theta": 1.57 },
  "state": "NAVIGATING",
  "speedMps": 0.82,
  "batterySoc": 91.4,
  "payloadId": "task-001-payload"
}
```

```json
{
  "robotId": "robot-1",
  "voltage": 7.42,
  "current": 0.8,
  "soc": 91.4,
  "health": 99.8
}
```

