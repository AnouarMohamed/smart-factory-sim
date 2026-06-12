/**
 * Central registry for active sensor failure states.
 */

import type { SensorFailureState, SensorFailureType, SensorType } from '@types';

export class SensorFailureInjector {
  private readonly failures = new Map<SensorType, SensorFailureState>();

  /** Activate a failure mode for a sensor type. */
  public activate(type: SensorType, failureType: SensorFailureType, timestamp: number, magnitude: number): void {
    this.failures.set(type, {
      type: failureType,
      active: true,
      startedAtMs: timestamp,
      magnitude
    });
  }

  /** Clear a failure mode for a sensor type. */
  public clear(type: SensorType): void {
    this.failures.delete(type);
  }

  /** Read the active failure for a sensor type. */
  public get(type: SensorType): SensorFailureState | null {
    return this.failures.get(type) ?? null;
  }
}

