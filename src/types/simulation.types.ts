/** Simulation ticks, replay, scenario lifecycle, and global event contracts. */

import type { GridZone, HazardType, ScenarioDefinition } from './factory.types';
import type { FleetConflict, FleetMetrics, TaskAssignment } from './fleet.types';
import type { MQTTMessage } from './mqtt.types';
import type { Pose2D } from './physics.types';
import type {
  AlertSeverity,
  RobotDigitalTwin,
  RobotState,
  Task
} from './robot.types';
import type { SensorFailureType, SensorReading, SensorType } from './sensor.types';

export type TickChannel = 'physics' | 'logic' | 'render';

export interface SimulationTickEvent {
  readonly channel: TickChannel;
  readonly tickNumber: number;
  readonly deltaMs: number;
  readonly simTimeMs: number;
}

export interface ReplayFrame {
  readonly index: number;
  readonly timestamp: number;
  readonly twins: readonly RobotDigitalTwin[];
  readonly mqttMessages: readonly MQTTMessage[];
}

export interface ScenarioLoadedEvent {
  readonly scenarioId: string;
  readonly scenario: ScenarioDefinition;
}

export interface SimulationEvents {
  readonly 'robot:state-changed': { readonly robotId: string; readonly from: RobotState; readonly to: RobotState };
  readonly 'robot:obstacle-detected': { readonly robotId: string; readonly distance: number; readonly angle: number };
  readonly 'robot:position-updated': { readonly robotId: string; readonly pose: Pose2D };
  readonly 'robot:battery-low': { readonly robotId: string; readonly level: number };
  readonly 'robot:emergency-stop': { readonly robotId: string; readonly reason: string };
  readonly 'robot:twin-updated': { readonly robotId: string; readonly twin: RobotDigitalTwin };
  readonly 'sensor:reading': {
    readonly sensorId: string;
    readonly type: SensorType;
    readonly value: SensorReading;
  };
  readonly 'sensor:anomaly': { readonly sensorId: string; readonly expected: number; readonly actual: number };
  readonly 'sensor:failure': { readonly sensorId: string; readonly failureType: SensorFailureType };
  readonly 'fleet:task-assigned': TaskAssignment;
  readonly 'fleet:task-completed': { readonly taskId: string; readonly robotId: string; readonly duration: number };
  readonly 'fleet:deadlock-detected': { readonly robotIds: readonly string[] };
  readonly 'fleet:deadlock-resolved': { readonly robotIds: readonly string[]; readonly resolution: string };
  readonly 'fleet:conflict-detected': FleetConflict;
  readonly 'fleet:metrics': FleetMetrics;
  readonly 'factory:worker-near-robot': {
    readonly workerId: string;
    readonly robotId: string;
    readonly distance: number;
  };
  readonly 'factory:inventory-updated': { readonly shelfId: string; readonly itemId: string; readonly newLevel: number };
  readonly 'factory:hazard-created': { readonly hazardId: string; readonly type: HazardType; readonly zone: GridZone };
  readonly 'mqtt:message-published': MQTTMessage;
  readonly 'mqtt:client-disconnected': { readonly clientId: string; readonly wasClean: boolean };
  readonly 'simulation:tick': SimulationTickEvent;
  readonly 'simulation:scenario-loaded': ScenarioLoadedEvent;
  readonly 'simulation:task-created': Task;
  readonly 'ui:panel-opened': { readonly panelId: string };
  readonly 'ui:alert-fired': { readonly alertId: string; readonly severity: AlertSeverity; readonly message: string };
}
