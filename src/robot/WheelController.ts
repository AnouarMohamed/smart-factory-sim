/**
 * Converts path-following velocity commands into differential wheel commands.
 */

import type { WheelAngularVelocity, WheelState } from '@types';
import type { DifferentialDrive } from '@physics/DifferentialDrive';

export class WheelController {
  private command: WheelAngularVelocity = { leftRadPerSec: 0, rightRadPerSec: 0 };
  private wheelState: WheelState = {
    leftRPM: 0,
    rightRPM: 0,
    leftSlip: false,
    rightSlip: false
  };

  public constructor(private readonly drive: DifferentialDrive) {}

  /** Set desired linear and angular velocity. */
  public setVelocity(linearMps: number, angularRadPerSec: number): WheelAngularVelocity {
    this.command = this.drive.inverse(linearMps, angularRadPerSec);
    return this.command;
  }

  /** Read the current wheel command. */
  public getCommand(): WheelAngularVelocity {
    return this.command;
  }

  /** Store and read latest wheel feedback state. */
  public updateFeedback(state: WheelState): WheelState {
    this.wheelState = state;
    return this.wheelState;
  }
}

