/** Typed fleet assignment, routing, and conflict policy constants. */

import type { PriorityWeight } from '@types';

export interface FleetConfig {
  readonly defaultFleetSize: number;
  readonly conflictLookaheadMs: number;
  readonly reservationStepMs: number;
  readonly taskPriorityWeights: readonly PriorityWeight[];
  readonly lowBatteryPenalty: number;
}

export const FLEET_CONFIG: FleetConfig = {
  defaultFleetSize: 2,
  conflictLookaheadMs: 8000,
  reservationStepMs: 500,
  taskPriorityWeights: [
    { priority: 'CRITICAL', weight: 100 },
    { priority: 'HIGH', weight: 50 },
    { priority: 'NORMAL', weight: 20 },
    { priority: 'LOW', weight: 5 }
  ],
  lowBatteryPenalty: 25
} as const;

