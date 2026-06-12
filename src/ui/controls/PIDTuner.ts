/**
 * PID tuner control model.
 */

import type { PIDGains } from '@types';

export class PIDTuner {
  private gains: PIDGains = { kp: 4.2, ki: 0.02, kd: 0.4 };

  /** Set PID gains. */
  public set(gains: PIDGains): void {
    this.gains = gains;
  }

  /** Return PID gains. */
  public get(): PIDGains {
    return this.gains;
  }
}

