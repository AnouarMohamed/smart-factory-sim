/** Typed MQTT namespace, publish cadence, QoS, and retained-message constants. */

import type { QoSLevel } from '@types';

export interface TopicPolicy {
  readonly qos: QoSLevel;
  readonly retained: boolean;
  readonly frequencyHz: number | null;
}

export interface MQTTConfig {
  readonly namespace: string;
  readonly maxMessagesStored: number;
  readonly policies: {
    readonly telemetry: TopicPolicy;
    readonly state: TopicPolicy;
    readonly ultrasonic: TopicPolicy;
    readonly irArray: TopicPolicy;
    readonly encoder: TopicPolicy;
    readonly imu: TopicPolicy;
    readonly battery: TopicPolicy;
    readonly anomaly: TopicPolicy;
    readonly lwt: TopicPolicy;
    readonly fleetMetrics: TopicPolicy;
    readonly systemHealth: TopicPolicy;
  };
}

export const MQTT_CONFIG: MQTTConfig = {
  namespace: 'factory',
  maxMessagesStored: 500,
  policies: {
    telemetry: { qos: 0, retained: true, frequencyHz: 10 },
    state: { qos: 1, retained: true, frequencyHz: null },
    ultrasonic: { qos: 0, retained: false, frequencyHz: 20 },
    irArray: { qos: 0, retained: false, frequencyHz: 50 },
    encoder: { qos: 0, retained: false, frequencyHz: 100 },
    imu: { qos: 0, retained: false, frequencyHz: 100 },
    battery: { qos: 0, retained: true, frequencyHz: 1 },
    anomaly: { qos: 2, retained: false, frequencyHz: null },
    lwt: { qos: 1, retained: true, frequencyHz: null },
    fleetMetrics: { qos: 0, retained: true, frequencyHz: 1 },
    systemHealth: { qos: 0, retained: true, frequencyHz: 1 }
  }
} as const;

export const MQTT_TOPICS = {
  robotTelemetry: (robotId: string): string => `factory/robots/${robotId}/telemetry`,
  robotState: (robotId: string): string => `factory/robots/${robotId}/state`,
  robotUltrasonic: (robotId: string): string => `factory/robots/${robotId}/sensors/ultrasonic`,
  robotIrArray: (robotId: string): string => `factory/robots/${robotId}/sensors/ir_array`,
  robotEncoder: (robotId: string): string => `factory/robots/${robotId}/sensors/encoder`,
  robotImu: (robotId: string): string => `factory/robots/${robotId}/sensors/imu`,
  robotBattery: (robotId: string): string => `factory/robots/${robotId}/battery`,
  robotAnomaly: (robotId: string): string => `factory/robots/${robotId}/anomaly`,
  robotLwt: (robotId: string): string => `factory/robots/${robotId}/lwt`,
  fleetMetrics: (): string => 'factory/fleet/metrics',
  systemClock: (): string => 'factory/system/clock',
  systemHealth: (): string => 'factory/system/health'
} as const;

