/**
 * HC-SR04 ultrasonic cone simulation with range limits, ray spread, blind spot, and noise.
 */

import { ROBOT_CONFIG } from '@config/robot.config';
import type { Pose2D, SensorFailureState, UltrasonicReading, Vector2 } from '@types';
import { SensorNoiseModel } from './SensorNoiseModel';

export class UltrasonicSensor {
  private failure: SensorFailureState | null = null;

  public constructor(private readonly noise = new SensorNoiseModel()) {}

  /** Set a sensor failure override. */
  public setFailure(failure: SensorFailureState | null): void {
    this.failure = failure;
  }

  /** Sample obstacle distances from seven rays spread across the cone. */
  public sample(pose: Pose2D, obstacles: readonly Vector2[], timestamp: number): UltrasonicReading {
    const rays = this.buildRays(pose);
    const hits = obstacles.filter((obstacle) => this.inCone(pose, obstacle));
    const rawDistance = hits.reduce(
      (closest, obstacle) => Math.min(closest, Math.hypot(obstacle.x - pose.x, obstacle.y - pose.y)),
      ROBOT_CONFIG.sensors.ultrasonicRangeMaxM
    );
    const valid =
      rawDistance >= ROBOT_CONFIG.sensors.ultrasonicRangeMinM &&
      rawDistance <= ROBOT_CONFIG.sensors.ultrasonicRangeMaxM;
    const sigma = rawDistance < 1 ? 0.005 : 0.015;
    const noisy = this.noise.scalar(rawDistance, sigma, timestamp);
    const distanceM = this.noise.applyFailure(noisy, this.failure);

    return {
      distanceM,
      valid: valid && Number.isFinite(distanceM),
      coneHits: hits,
      rays
    };
  }

  private buildRays(pose: Pose2D): readonly Vector2[] {
    return Array.from({ length: 7 }, (_, index): Vector2 => {
      const ratio = index / 6;
      const angle =
        pose.theta +
        (ratio * 2 - 1) * ROBOT_CONFIG.sensors.ultrasonicConeHalfAngleRad;
      return {
        x: pose.x + Math.cos(angle) * ROBOT_CONFIG.sensors.ultrasonicRangeMaxM,
        y: pose.y + Math.sin(angle) * ROBOT_CONFIG.sensors.ultrasonicRangeMaxM
      };
    });
  }

  private inCone(pose: Pose2D, obstacle: Vector2): boolean {
    const dx = obstacle.x - pose.x;
    const dy = obstacle.y - pose.y;
    const distance = Math.hypot(dx, dy);
    if (distance > ROBOT_CONFIG.sensors.ultrasonicRangeMaxM) {
      return false;
    }

    const angle = Math.atan2(dy, dx);
    const error = Math.abs(((angle - pose.theta + Math.PI) % (Math.PI * 2)) - Math.PI);
    return error <= ROBOT_CONFIG.sensors.ultrasonicConeHalfAngleRad;
  }
}

