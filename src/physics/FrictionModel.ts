/**
 * Floor friction lookup and wheel slip threshold calculations.
 */

import type { FrictionZone, Vector2 } from '@types';

export class FrictionModel {
  public constructor(
    private readonly defaultCoefficient: number,
    private readonly zones: readonly FrictionZone[] = []
  ) {}

  /** Return the friction coefficient at a world position. */
  public coefficientAt(position: Vector2): number {
    const zone = this.zones.find(
      (candidate) =>
        position.x >= candidate.bounds.min.x &&
        position.x <= candidate.bounds.max.x &&
        position.y >= candidate.bounds.min.y &&
        position.y <= candidate.bounds.max.y
    );
    return zone?.coefficient ?? this.defaultCoefficient;
  }

  /** Return maximum acceleration before slip for a coefficient and gravity. */
  public maxAcceleration(coefficient: number, gravityMps2: number): number {
    return coefficient * gravityMps2;
  }
}

