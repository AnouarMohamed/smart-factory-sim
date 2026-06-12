/**
 * Deterministic Gaussian-like noise and failure transformation helpers for virtual sensors.
 */

import type { SensorFailureState } from '@types';

export class SensorNoiseModel {
  /** Return a deterministic pseudo-random value in the range -1 to 1. */
  public pseudoNoise(seed: number): number {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return (value - Math.floor(value)) * 2 - 1;
  }

  /** Add bounded noise to a scalar measurement. */
  public scalar(value: number, sigma: number, seed: number): number {
    return value + this.pseudoNoise(seed) * sigma;
  }

  /** Apply a failure state to a scalar measurement. */
  public applyFailure(value: number, failure: SensorFailureState | null): number {
    if (!failure?.active) {
      return value;
    }

    if (failure.type === 'nan') {
      return Number.NaN;
    }

    if (failure.type === 'dropout') {
      return 0;
    }

    if (failure.type === 'drift' || failure.type === 'bias') {
      return value + failure.magnitude;
    }

    return value;
  }
}

