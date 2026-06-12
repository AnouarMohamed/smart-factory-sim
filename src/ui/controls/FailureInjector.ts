/**
 * Failure injection command surface.
 */

import type { SensorFailureType, SensorType } from '@types';

export interface FailureCommand {
  readonly sensor: SensorType;
  readonly failure: SensorFailureType;
  readonly magnitude: number;
}

export class FailureInjector {
  /** Return built-in failure command list. */
  public commands(): readonly FailureCommand[] {
    return [
      { sensor: 'ultrasonic', failure: 'nan', magnitude: 0 },
      { sensor: 'ultrasonic', failure: 'drift', magnitude: 0.45 },
      { sensor: 'ir_array', failure: 'dropout', magnitude: 0 },
      { sensor: 'encoder', failure: 'bias', magnitude: 120 },
      { sensor: 'imu', failure: 'bias', magnitude: 0.2 }
    ];
  }
}

