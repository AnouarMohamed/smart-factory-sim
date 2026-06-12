/**
 * Junction conflict detection and right-of-way resolver for robot routes.
 */

import type { ConflictResolution, FleetConflict, RobotDigitalTwin, Vector2 } from '@types';

export class ConflictResolver {
  /** Detect a route-cell conflict between robot paths. */
  public detect(robots: readonly RobotDigitalTwin[], timestamp: number): FleetConflict | null {
    for (let leftIndex = 0; leftIndex < robots.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < robots.length; rightIndex += 1) {
        const cell = this.firstSharedCell(robots[leftIndex].path, robots[rightIndex].path);
        if (cell) {
          return {
            id: `conflict-${robots[leftIndex].id}-${robots[rightIndex].id}-${timestamp.toFixed(0)}`,
            robotIds: [robots[leftIndex].id, robots[rightIndex].id],
            cell,
            severity: 'MEDIUM',
            detectedAtMs: timestamp
          };
        }
      }
    }

    return null;
  }

  /** Resolve a detected conflict by assigning right of way. */
  public resolve(conflict: FleetConflict, robots: readonly RobotDigitalTwin[]): ConflictResolution {
    const candidates = conflict.robotIds
      .map((robotId) => robots.find((robot) => robot.id === robotId))
      .filter((robot): robot is RobotDigitalTwin => robot !== undefined);
    const winner = candidates
      .slice()
      .sort((a, b) => this.priorityScore(b) - this.priorityScore(a))[0];

    return {
      conflictId: conflict.id,
      winnerRobotId: winner?.id ?? conflict.robotIds[0],
      waitingRobotIds: conflict.robotIds.filter((robotId) => robotId !== (winner?.id ?? conflict.robotIds[0])),
      reason: 'Higher task priority and battery state wins junction right of way'
    };
  }

  private firstSharedCell(left: readonly Vector2[], right: readonly Vector2[]): Vector2 | null {
    const rightKeys = new Set(right.map((cell) => `${Math.round(cell.x)},${Math.round(cell.y)}`));
    return (
      left.find((cell) => rightKeys.has(`${Math.round(cell.x)},${Math.round(cell.y)}`)) ?? null
    );
  }

  private priorityScore(robot: RobotDigitalTwin): number {
    const priority = robot.currentTask?.priority ?? 'LOW';
    const priorityScore = priority === 'CRITICAL' ? 100 : priority === 'HIGH' ? 50 : priority === 'NORMAL' ? 20 : 5;
    return priorityScore + robot.battery.soc / 10;
  }
}

