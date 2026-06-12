/** Robot state, task, payload, telemetry, and digital twin contracts. */

import type { Pose2D, Vector2, WheelState } from './physics.types';
import type {
  EncoderReading,
  IMUReading,
  IRSensorArrayReading,
  UltrasonicReading
} from './sensor.types';

export type InitStep = 'BOOT' | 'SENSOR_CHECK' | 'MQTT_CONNECT' | 'SAFETY_READY';
export type LoadStep = 'ALIGN' | 'LOWER_ARM' | 'ENGAGE_PAYLOAD' | 'RAISE_ARM';
export type UnloadStep = 'ALIGN' | 'LOWER_ARM' | 'RELEASE_PAYLOAD' | 'CLEAR_DOCK';
export type ErrorCode =
  | 'SENSOR_FAILURE'
  | 'MOTOR_FAULT'
  | 'BATTERY_FAULT'
  | 'PATH_UNREACHABLE'
  | 'UNKNOWN';

export type RobotState =
  | { readonly kind: 'IDLE'; readonly since: number }
  | { readonly kind: 'INITIALIZING'; readonly step: InitStep; readonly progress: number }
  | {
      readonly kind: 'NAVIGATING';
      readonly destination: Vector2;
      readonly path: readonly Vector2[];
      readonly eta: number;
    }
  | {
      readonly kind: 'OBSTACLE_BLOCKED';
      readonly obstacleDistance: number;
      readonly blockedSince: number;
      readonly replanAttempts: number;
    }
  | {
      readonly kind: 'LOADING';
      readonly targetShelf: string;
      readonly step: LoadStep;
      readonly armAngle: number;
    }
  | {
      readonly kind: 'TRANSPORTING';
      readonly payload: Payload;
      readonly destination: Vector2;
      readonly eta: number;
    }
  | {
      readonly kind: 'UNLOADING';
      readonly targetDock: string;
      readonly step: UnloadStep;
      readonly armAngle: number;
    }
  | { readonly kind: 'CHARGING'; readonly stationId: string; readonly chargeLevel: number; readonly eta: number }
  | { readonly kind: 'ERROR'; readonly code: ErrorCode; readonly message: string; readonly since: number }
  | { readonly kind: 'EMERGENCY_STOP'; readonly reason: string; readonly triggeredAt: number };

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface Payload {
  readonly id: string;
  readonly itemId: string;
  readonly weightKg: number;
  readonly dimensionsM: {
    readonly width: number;
    readonly depth: number;
    readonly height: number;
  };
}

export interface Task {
  readonly id: string;
  readonly priority: TaskPriority;
  readonly pickup: Vector2;
  readonly dropoff: Vector2;
  readonly payload: Payload;
  readonly createdAtMs: number;
}

export interface BatterySnapshot {
  readonly voltage: number;
  readonly current: number;
  readonly soc: number;
  readonly health: number;
  readonly cycleCount: number;
}

export interface MaintenanceSnapshot {
  readonly motorHours: number;
  readonly liftCycles: number;
  readonly bearingWear: number;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface Alert {
  readonly id: string;
  readonly severity: AlertSeverity;
  readonly message: string;
  readonly timestamp: number;
  readonly source: string;
}

export interface AnomalyRecord {
  readonly id: string;
  readonly type: string;
  readonly severity: AlertSeverity;
  readonly description: string;
  readonly timestamp: number;
  readonly affectedComponent: string;
}

export interface RobotDigitalTwin {
  readonly id: string;
  readonly timestamp: number;
  readonly pose: Pose2D;
  readonly velocity: { readonly linear: number; readonly angular: number };
  readonly wheels: WheelState;
  readonly state: RobotState;
  readonly currentTask: Task | null;
  readonly path: readonly Vector2[];
  readonly eta: number | null;
  readonly payload: Payload | null;
  readonly armAngle: number;
  readonly armState: 'LOWERED' | 'RAISED' | 'MOVING';
  readonly sensors: {
    readonly ultrasonic: UltrasonicReading;
    readonly irArray: IRSensorArrayReading;
    readonly encoder: EncoderReading;
    readonly imu: IMUReading;
  };
  readonly battery: BatterySnapshot;
  readonly maintenance: MaintenanceSnapshot;
  readonly anomalies: readonly AnomalyRecord[];
  readonly alerts: readonly Alert[];
}

export interface RobotTelemetry {
  readonly robotId: string;
  readonly timestamp: number;
  readonly pose: Pose2D;
  readonly state: RobotState['kind'];
  readonly speedMps: number;
  readonly batterySoc: number;
  readonly payloadId: string | null;
}

