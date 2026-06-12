/**
 * Accelerometer and gyroscope simulation with deterministic drift bias.
 */

import type { IMUReading, SensorFailureState, Vector3 } from '@types';
import { SensorNoiseModel } from './SensorNoiseModel';

export class IMUSensor {
  private failure: SensorFailureState | null = null;

  public constructor(private readonly noise = new SensorNoiseModel()) {}

  /** Set an IMU failure override. */
  public setFailure(failure: SensorFailureState | null): void {
    this.failure = failure;
  }

  /** Sample acceleration and gyro readings. */
  public sample(linearAcceleration: Vector3, angularVelocityZ: number, timestamp: number): IMUReading {
    const bias = {
      x: this.noise.pseudoNoise(timestamp) * 0.002,
      y: this.noise.pseudoNoise(timestamp + 1) * 0.002,
      z: this.noise.applyFailure(this.noise.pseudoNoise(timestamp + 2) * 0.003, this.failure)
    };

    return {
      acceleration: {
        x: linearAcceleration.x + bias.x,
        y: linearAcceleration.y + bias.y,
        z: linearAcceleration.z
      },
      gyroscope: {
        x: 0,
        y: 0,
        z: angularVelocityZ + bias.z
      },
      driftBias: bias
    };
  }
}

