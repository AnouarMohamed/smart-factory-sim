/**
 * Quadrature wheel encoder tick simulation from wheel RPM.
 */

import { ROBOT_CONFIG } from '@config/robot.config';
import type { EncoderReading, SensorFailureState } from '@types';

export class WheelEncoder {
  private leftTicks = 0;
  private rightTicks = 0;
  private failure: SensorFailureState | null = null;

  /** Set an encoder failure override. */
  public setFailure(failure: SensorFailureState | null): void {
    this.failure = failure;
  }

  /** Advance encoder ticks from wheel speed and elapsed seconds. */
  public step(leftRPM: number, rightRPM: number, deltaSeconds: number): EncoderReading {
    const ticksPerSecondLeft = (leftRPM / 60) * ROBOT_CONFIG.sensors.encoderTicksPerRevolution;
    const ticksPerSecondRight = (rightRPM / 60) * ROBOT_CONFIG.sensors.encoderTicksPerRevolution;
    const dropoutFactor = this.failure?.active && this.failure.type === 'dropout' ? 0 : 1;
    this.leftTicks += Math.round(ticksPerSecondLeft * deltaSeconds * dropoutFactor);
    this.rightTicks += Math.round(ticksPerSecondRight * deltaSeconds * dropoutFactor);

    return {
      leftTicks: this.leftTicks,
      rightTicks: this.rightTicks,
      leftRPM,
      rightRPM
    };
  }
}

