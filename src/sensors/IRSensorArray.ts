/**
 * Five-channel ground reflectance sensor and weighted line-error estimator.
 */

import type { IRSensorArrayReading, SensorFailureState } from '@types';
import { SensorNoiseModel } from './SensorNoiseModel';

const SENSOR_WEIGHTS: readonly [number, number, number, number, number] = [-2, -1, 0, 1, 2];

export class IRSensorArray {
  private failure: SensorFailureState | null = null;

  public constructor(private readonly noise = new SensorNoiseModel()) {}

  /** Set a sensor failure override. */
  public setFailure(failure: SensorFailureState | null): void {
    this.failure = failure;
  }

  /** Sample the line offset under the sensor array. */
  public sample(lineOffset: number, timestamp: number): IRSensorArrayReading {
    const readings = SENSOR_WEIGHTS.map((weight, index) => {
      const distance = Math.abs(weight - lineOffset);
      const reflectance = Math.min(0.9, 0.1 + distance * 0.35);
      return this.noise.applyFailure(this.noise.scalar(reflectance, 0.02, timestamp + index), this.failure);
    }) as [number, number, number, number, number];
    const digital = readings.map((reading) => reading < 0.45) as [boolean, boolean, boolean, boolean, boolean];
    const weightedSum = readings.reduce(
      (sum, reading, index) => sum + (1 - reading) * SENSOR_WEIGHTS[index],
      0
    );
    const total = readings.reduce((sum, reading) => sum + (1 - reading), 0);
    const lineError = total === 0 ? 0 : weightedSum / total;

    return {
      readings,
      digital,
      lineError,
      confidence: Math.min(1, total / 2.5)
    };
  }
}

