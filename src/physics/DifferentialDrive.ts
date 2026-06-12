/**
 * Differential drive kinematic model with motor RPM limits and wheel-slip flags.
 */

import { ROBOT_CONFIG } from '@config/robot.config';
import type {
  DifferentialDriveParams,
  KinematicState,
  Pose2D,
  WheelAngularVelocity,
  WheelState
} from '@types';

export class DifferentialDrive {
  public constructor(private readonly params: DifferentialDriveParams = ROBOT_CONFIG.drive) {}

  /** Integrate pose forward using wheel angular velocities and timestep in seconds. */
  public integrate(
    pose: Pose2D,
    wheelsRadPerSec: WheelAngularVelocity,
    dtSeconds: number,
    frictionCoefficient: number
  ): KinematicState {
    const left = this.clampWheelSpeed(wheelsRadPerSec.leftRadPerSec);
    const right = this.clampWheelSpeed(wheelsRadPerSec.rightRadPerSec);
    const linearVelocity = (this.params.wheelRadiusM / 2) * (right + left);
    const angularVelocity = (this.params.wheelRadiusM / this.params.trackWidthM) * (right - left);
    const slip = this.isSlipping(linearVelocity, dtSeconds, frictionCoefficient);
    const effectiveLinearVelocity = slip ? linearVelocity * 0.72 : linearVelocity;
    const nextTheta = this.normalizeAngle(pose.theta + angularVelocity * dtSeconds);

    return {
      pose: {
        x: pose.x + effectiveLinearVelocity * Math.cos(pose.theta) * dtSeconds,
        y: pose.y + effectiveLinearVelocity * Math.sin(pose.theta) * dtSeconds,
        theta: nextTheta
      },
      linearVelocity: effectiveLinearVelocity,
      angularVelocity,
      wheels: this.toWheelState(left, right, slip)
    };
  }

  /** Convert desired linear and angular velocity into wheel angular velocity. */
  public inverse(linearVelocity: number, angularVelocity: number): WheelAngularVelocity {
    return {
      leftRadPerSec:
        (linearVelocity - (angularVelocity * this.params.trackWidthM) / 2) / this.params.wheelRadiusM,
      rightRadPerSec:
        (linearVelocity + (angularVelocity * this.params.trackWidthM) / 2) / this.params.wheelRadiusM
    };
  }

  /** Return maximum linear speed from wheel geometry and RPM. */
  public maxLinearSpeedMps(): number {
    return this.params.wheelRadiusM * this.maxWheelRadPerSec();
  }

  private maxWheelRadPerSec(): number {
    return (this.params.maxWheelRPM * 2 * Math.PI) / 60;
  }

  private clampWheelSpeed(radPerSec: number): number {
    const max = this.maxWheelRadPerSec();
    return Math.max(-max, Math.min(max, radPerSec));
  }

  private toWheelState(leftRadPerSec: number, rightRadPerSec: number, slip: boolean): WheelState {
    return {
      leftRPM: (leftRadPerSec * 60) / (2 * Math.PI),
      rightRPM: (rightRadPerSec * 60) / (2 * Math.PI),
      leftSlip: slip,
      rightSlip: slip
    };
  }

  private isSlipping(linearVelocity: number, dtSeconds: number, frictionCoefficient: number): boolean {
    if (dtSeconds <= 0) {
      return false;
    }

    const acceleration = Math.abs(linearVelocity) / dtSeconds;
    return acceleration > frictionCoefficient * 9.80665;
  }

  private normalizeAngle(angleRad: number): number {
    const twoPi = Math.PI * 2;
    return ((angleRad + Math.PI) % twoPi) - Math.PI;
  }
}

