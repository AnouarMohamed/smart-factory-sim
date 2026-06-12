/**
 * Fuses wheel encoder and IMU signals into a simple pose estimate.
 */

import { ROBOT_CONFIG } from '@config/robot.config';
import type { EncoderReading, FusedPoseEstimate, IMUReading, Pose2D } from '@types';

export class SensorFusion {
  private pose: Pose2D;

  public constructor(initialPose: Pose2D) {
    this.pose = initialPose;
  }

  /** Fuse encoder and IMU readings using differential-drive odometry. */
  public update(encoder: EncoderReading, imu: IMUReading, deltaSeconds: number): FusedPoseEstimate {
    const leftRadPerSec = (encoder.leftRPM * 2 * Math.PI) / 60;
    const rightRadPerSec = (encoder.rightRPM * 2 * Math.PI) / 60;
    const linearVelocity = (ROBOT_CONFIG.drive.wheelRadiusM / 2) * (leftRadPerSec + rightRadPerSec);
    const yawRate =
      (ROBOT_CONFIG.drive.wheelRadiusM / ROBOT_CONFIG.drive.trackWidthM) *
        (rightRadPerSec - leftRadPerSec) *
        0.7 +
      imu.gyroscope.z * 0.3;

    this.pose = {
      x: this.pose.x + Math.cos(this.pose.theta) * linearVelocity * deltaSeconds,
      y: this.pose.y + Math.sin(this.pose.theta) * linearVelocity * deltaSeconds,
      theta: this.pose.theta + yawRate * deltaSeconds
    };

    return {
      pose: this.pose,
      confidence: 0.82,
      covariance: [0.02, 0.02, 0.04]
    };
  }
}

