/**
 * Hazard registry for blocked zones and emergency events.
 */

import type { EventBus } from '@core/EventBus';
import type { GridZone, HazardEntity, HazardType } from '@types';

export class HazardSystem {
  private readonly hazards: HazardEntity[];

  public constructor(
    hazards: readonly HazardEntity[],
    private readonly eventBus: EventBus
  ) {
    this.hazards = hazards.slice();
  }

  /** Add a hazard and emit an event. */
  public add(type: HazardType, zone: GridZone, timestamp: number): HazardEntity {
    const hazard: HazardEntity = {
      id: `${type.toLowerCase()}-${timestamp.toFixed(0)}`,
      type,
      zone,
      createdAtMs: timestamp
    };
    this.hazards.push(hazard);
    this.eventBus.emit('factory:hazard-created', {
      hazardId: hazard.id,
      type,
      zone
    });
    return hazard;
  }

  /** Return active hazards. */
  public all(): readonly HazardEntity[] {
    return this.hazards;
  }
}

