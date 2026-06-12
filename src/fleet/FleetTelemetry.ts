/**
 * Aggregates robot snapshots and task state into fleet KPIs.
 */

import type { FleetMetrics, FleetTask, RobotDigitalTwin } from '@types';

export class FleetTelemetry {
  /** Build fleet metrics from robots and tasks. */
  public aggregate(robots: readonly RobotDigitalTwin[], tasks: readonly FleetTask[]): FleetMetrics {
    const activeRobots = robots.filter((robot) => robot.state.kind !== 'IDLE' && robot.state.kind !== 'CHARGING').length;
    const queuedTasks = tasks.filter((task) => task.status === 'QUEUED').length;
    const completedTasks = tasks.filter((task) => task.status === 'COMPLETED').length;
    const averageBatterySoc =
      robots.length === 0 ? 0 : robots.reduce((sum, robot) => sum + robot.battery.soc, 0) / robots.length;

    return {
      activeRobots,
      queuedTasks,
      completedTasks,
      conflictsResolved: 0,
      averageBatterySoc
    };
  }
}

