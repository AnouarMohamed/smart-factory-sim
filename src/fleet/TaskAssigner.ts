/**
 * Assigns queued tasks to robots by priority, distance, and battery.
 */

import type { RobotDigitalTwin, TaskAssignment, Vector2 } from '@types';

export class TaskAssigner {
  /** Score candidate robots and return the best assignment. */
  public assign(taskId: string, pickup: Vector2, robots: readonly RobotDigitalTwin[]): TaskAssignment | null {
    const available = robots.filter((robot) => robot.state.kind === 'IDLE' || robot.state.kind === 'NAVIGATING');
    if (available.length === 0) {
      return null;
    }

    const scored = available.map((robot) => {
      const distance = Math.hypot(robot.pose.x - pickup.x, robot.pose.y - pickup.y);
      const batteryPenalty = robot.battery.soc < 25 ? 20 : 0;
      return {
        robot,
        score: distance + batteryPenalty
      };
    });
    scored.sort((a, b) => a.score - b.score);
    const best = scored[0];

    return {
      taskId,
      robotId: best.robot.id,
      score: best.score,
      reason: 'Nearest available robot with battery penalty applied'
    };
  }
}

