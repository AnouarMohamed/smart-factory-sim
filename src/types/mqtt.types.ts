/** MQTT topic, payload, QoS, client, and broker contracts. */

import type { Alert, RobotTelemetry } from './robot.types';

export type QoSLevel = 0 | 1 | 2;

export interface MQTTMessage<TPayload = unknown> {
  readonly topic: string;
  readonly payload: TPayload;
  readonly qos: QoSLevel;
  readonly retained: boolean;
  readonly timestamp: number;
  readonly publisherId: string;
}

export interface MQTTSubscription {
  readonly clientId: string;
  readonly topicFilter: string;
  readonly qos: QoSLevel;
}

export interface LastWill {
  readonly topic: string;
  readonly payload: unknown;
  readonly qos: QoSLevel;
  readonly retained: boolean;
}

export interface MQTTClientConnection {
  readonly clientId: string;
  readonly connected: boolean;
  readonly lastSeen: number;
  readonly will: LastWill | null;
}

export interface BatteryPayload {
  readonly robotId: string;
  readonly voltage: number;
  readonly current: number;
  readonly soc: number;
  readonly health: number;
}

export interface FleetMetricsPayload {
  readonly activeRobots: number;
  readonly queuedTasks: number;
  readonly completedTasks: number;
  readonly averageCycleTimeSeconds: number;
}

export interface SystemHealthPayload {
  readonly fps: number;
  readonly physicsMs: number;
  readonly logicMs: number;
  readonly mqttMessagesPerSecond: number;
}

export interface MQTTTopicPayloadMap {
  readonly telemetry: RobotTelemetry;
  readonly battery: BatteryPayload;
  readonly alert: Alert;
  readonly fleetMetrics: FleetMetricsPayload;
  readonly systemHealth: SystemHealthPayload;
}

