/**
 * Fleet overview panel renderer.
 */

import type { FleetMetrics, FleetTask, RobotDigitalTwin } from '@types';

export class FleetPanel {
  /** Render fleet robot and task state. */
  public render(robots: readonly RobotDigitalTwin[], tasks: readonly FleetTask[], metrics: FleetMetrics | null): string {
    return `<section class="panel">
      <h2>Fleet</h2>
      <div class="metric-grid compact">
        <div><span>Robots</span><strong>${robots.length}</strong></div>
        <div><span>Active</span><strong>${metrics?.activeRobots ?? 0}</strong></div>
        <div><span>Queued</span><strong>${metrics?.queuedTasks ?? tasks.filter((task) => task.status === 'QUEUED').length}</strong></div>
        <div><span>Complete</span><strong>${metrics?.completedTasks ?? 0}</strong></div>
      </div>
    </section>`;
  }
}

