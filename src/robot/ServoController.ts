/**
 * Forklift arm servo simulation from PWM-style target angle to current angle.
 */

import { ROBOT_CONFIG } from '@config/robot.config';

export class ServoController {
  private angleDeg = ROBOT_CONFIG.servo.loweredDeg;
  private targetDeg = ROBOT_CONFIG.servo.loweredDeg;

  /** Set the desired arm angle in degrees. */
  public setTarget(angleDeg: number): void {
    this.targetDeg = Math.max(ROBOT_CONFIG.servo.loweredDeg, Math.min(ROBOT_CONFIG.servo.raisedDeg, angleDeg));
  }

  /** Advance the servo angle toward its target. */
  public step(deltaSeconds: number): number {
    const maxStep = ROBOT_CONFIG.servo.speedDegPerSecond * deltaSeconds;
    const error = this.targetDeg - this.angleDeg;
    const step = Math.sign(error) * Math.min(Math.abs(error), maxStep);
    this.angleDeg += step;
    return this.angleDeg;
  }

  /** Return the current arm angle. */
  public angle(): number {
    return this.angleDeg;
  }

  /** Return the current arm state label. */
  public state(): 'LOWERED' | 'RAISED' | 'MOVING' {
    if (Math.abs(this.angleDeg - this.targetDeg) > 0.5) {
      return 'MOVING';
    }

    return this.angleDeg > 45 ? 'RAISED' : 'LOWERED';
  }
}

