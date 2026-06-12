/**
 * Conveyor belt state and crate transport simulation.
 */

import type { ConveyorEntity } from '@types';

export class ConveyorBelt {
  private entity: ConveyorEntity;
  private phase = 0;

  public constructor(entity: ConveyorEntity) {
    this.entity = entity;
  }

  /** Advance conveyor belt animation phase. */
  public step(deltaSeconds: number): ConveyorEntity {
    if (this.entity.active) {
      this.phase = (this.phase + deltaSeconds * this.entity.speedMps) % 1;
    }

    return this.entity;
  }

  /** Return visual belt phase. */
  public animationPhase(): number {
    return this.phase;
  }

  /** Return conveyor entity state. */
  public snapshot(): ConveyorEntity {
    return this.entity;
  }
}

