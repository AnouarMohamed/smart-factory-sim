/**
 * Charging station occupancy and robot charging state.
 */

import type { ChargingStationEntity } from '@types';

export class ChargingStation {
  private entity: ChargingStationEntity;

  public constructor(entity: ChargingStationEntity) {
    this.entity = entity;
  }

  /** Reserve the station for a robot. */
  public occupy(robotId: string): boolean {
    if (this.entity.occupiedBy) {
      return false;
    }

    this.entity = { ...this.entity, occupiedBy: robotId };
    return true;
  }

  /** Release the station. */
  public release(): void {
    this.entity = { ...this.entity, occupiedBy: null };
  }

  /** Return charging station state. */
  public snapshot(): ChargingStationEntity {
    return this.entity;
  }
}

