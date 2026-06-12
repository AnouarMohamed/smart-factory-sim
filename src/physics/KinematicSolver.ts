/**
 * Forward and inverse kinematic helper functions for 2D robot motion.
 */

import type { Pose2D, Vector2 } from '@types';

export class KinematicSolver {
  /** Return heading angle from a pose to a target point. */
  public headingTo(pose: Pose2D, target: Vector2): number {
    return Math.atan2(target.y - pose.y, target.x - pose.x);
  }

  /** Return signed shortest angle delta. */
  public angleError(currentRad: number, targetRad: number): number {
    const twoPi = Math.PI * 2;
    return ((targetRad - currentRad + Math.PI) % twoPi) - Math.PI;
  }

  /** Return distance from a pose to a point. */
  public distanceTo(pose: Pose2D, target: Vector2): number {
    return Math.hypot(target.x - pose.x, target.y - pose.y);
  }

  /** Project a pose forward by distance in its current heading. */
  public project(pose: Pose2D, distanceM: number): Vector2 {
    return {
      x: pose.x + Math.cos(pose.theta) * distanceM,
      y: pose.y + Math.sin(pose.theta) * distanceM
    };
  }
}

