/** Typed factory layout defaults, shifts, and visual scale constants. */

import type { ShiftDefinition } from '@types';

export interface FactoryConfig {
  readonly defaultTileSizeM: number;
  readonly floorFrictionCoefficient: number;
  readonly workerSpeedMps: number;
  readonly workerSafetyBubbleM: number;
  readonly shifts: readonly ShiftDefinition[];
}

export const FACTORY_CONFIG: FactoryConfig = {
  defaultTileSizeM: 0.5,
  floorFrictionCoefficient: 0.72,
  workerSpeedMps: 0.82,
  workerSafetyBubbleM: 1.5,
  shifts: [
    { id: 'DAY', startsAtHour: 6, endsAtHour: 14, workerDensity: 'HIGH', productionRate: 1 },
    { id: 'EVENING', startsAtHour: 14, endsAtHour: 22, workerDensity: 'MEDIUM', productionRate: 0.8 },
    { id: 'NIGHT', startsAtHour: 22, endsAtHour: 6, workerDensity: 'LOW', productionRate: 0.6 }
  ]
} as const;

