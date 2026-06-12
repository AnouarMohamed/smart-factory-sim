/** Sensor readings, failure modes, and fused estimation contracts. */

import type { Pose2D, Vector2, Vector3 } from './physics.types';

export type SensorType = 'ultrasonic' | 'ir_array' | 'encoder' | 'imu';

export type SensorFailureType = 'dropout' | 'drift' | 'freeze' | 'nan' | 'bias';

export interface SensorMetadata {
  readonly sensorId: string;
  readonly robotId: string;
  readonly type: SensorType;
  readonly timestamp: number;
}

export interface UltrasonicReading {
  readonly distanceM: number;
  readonly valid: boolean;
  readonly coneHits: readonly Vector2[];
  readonly rays: readonly Vector2[];
}

export interface IRSensorArrayReading {
  readonly readings: readonly [number, number, number, number, number];
  readonly digital: readonly [boolean, boolean, boolean, boolean, boolean];
  readonly lineError: number;
  readonly confidence: number;
}

export interface EncoderReading {
  readonly leftTicks: number;
  readonly rightTicks: number;
  readonly leftRPM: number;
  readonly rightRPM: number;
}

export interface IMUReading {
  readonly acceleration: Vector3;
  readonly gyroscope: Vector3;
  readonly driftBias: Vector3;
}

export type SensorReading =
  | UltrasonicReading
  | IRSensorArrayReading
  | EncoderReading
  | IMUReading;

export interface SensorFailureState {
  readonly type: SensorFailureType;
  readonly active: boolean;
  readonly startedAtMs: number;
  readonly magnitude: number;
}

export interface FusedPoseEstimate {
  readonly pose: Pose2D;
  readonly confidence: number;
  readonly covariance: readonly [number, number, number];
}

