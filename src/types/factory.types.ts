/** Factory entities, zones, workers, hazards, and scenario schema. */

import type { TaskPriority } from './robot.types';
import type { Vector2 } from './physics.types';

export type GridZoneType =
  | 'FLOOR'
  | 'SHELF'
  | 'CONVEYOR'
  | 'DOCK'
  | 'CHARGER'
  | 'NO_GO'
  | 'PRIORITY_CORRIDOR'
  | 'HAZARD';

export interface GridZone {
  readonly id: string;
  readonly type: GridZoneType;
  readonly label: string;
  readonly cells: readonly Vector2[];
  readonly costMultiplier: number;
}

export interface GridCell {
  readonly x: number;
  readonly y: number;
  readonly blocked: boolean;
  readonly baseCost: number;
  readonly zoneId: string | null;
}

export interface ShelfEntity {
  readonly id: string;
  readonly position: Vector2;
  readonly size: Vector2;
  readonly capacity: number;
  readonly stockLevel: number;
  readonly itemId: string;
}

export interface ConveyorEntity {
  readonly id: string;
  readonly start: Vector2;
  readonly end: Vector2;
  readonly speedMps: number;
  readonly active: boolean;
  readonly crateCount: number;
}

export interface LoadingDockEntity {
  readonly id: string;
  readonly position: Vector2;
  readonly status: 'EMPTY' | 'LOADING' | 'LOADED' | 'DISPATCHING';
}

export interface ChargingStationEntity {
  readonly id: string;
  readonly position: Vector2;
  readonly chargeRateSocPerSecond: number;
  readonly occupiedBy: string | null;
}

export type WorkerState = 'WALKING_TO_STATION' | 'AT_STATION' | 'WALKING_TO_NEXT' | 'BREAK' | 'SHIFT_CHANGE';

export interface WorkerEntity {
  readonly id: string;
  readonly position: Vector2;
  readonly route: readonly Vector2[];
  readonly routeIndex: number;
  readonly state: WorkerState;
  readonly safetyBubbleM: number;
}

export type HazardType = 'WET_FLOOR' | 'BLOCKED_EXIT' | 'SPILL' | 'VIRTUAL_OBSTACLE';

export interface HazardEntity {
  readonly id: string;
  readonly type: HazardType;
  readonly zone: GridZone;
  readonly createdAtMs: number;
}

export type ShiftId = 'DAY' | 'EVENING' | 'NIGHT';

export interface ShiftDefinition {
  readonly id: ShiftId;
  readonly startsAtHour: number;
  readonly endsAtHour: number;
  readonly workerDensity: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly productionRate: number;
}

export interface ScenarioTaskDefinition {
  readonly id: string;
  readonly priority: TaskPriority;
  readonly pickup: Vector2;
  readonly dropoff: Vector2;
  readonly itemId: string;
  readonly weightKg: number;
}

export interface ScenarioRobotDefinition {
  readonly id: string;
  readonly start: Vector2;
  readonly headingRad: number;
}

export interface ScenarioDefinition {
  readonly id: string;
  readonly name: string;
  readonly purpose: string;
  readonly grid: {
    readonly width: number;
    readonly height: number;
    readonly tileSizeM: number;
  };
  readonly robots: readonly ScenarioRobotDefinition[];
  readonly shelves: readonly ShelfEntity[];
  readonly conveyors: readonly ConveyorEntity[];
  readonly docks: readonly LoadingDockEntity[];
  readonly chargers: readonly ChargingStationEntity[];
  readonly workers: readonly WorkerEntity[];
  readonly zones: readonly GridZone[];
  readonly hazards: readonly HazardEntity[];
  readonly tasks: readonly ScenarioTaskDefinition[];
  readonly startHour: number;
}

