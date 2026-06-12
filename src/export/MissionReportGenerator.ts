/**
 * Printable HTML mission report generator.
 */

import type { FleetMetrics, RobotDigitalTwin, ScenarioDefinition } from '@types';

export class MissionReportGenerator {
  /** Generate mission report HTML. */
  public generate(
    scenario: ScenarioDefinition,
    robots: readonly RobotDigitalTwin[],
    metrics: FleetMetrics
  ): string {
    return `<!doctype html>
      <html lang="en">
        <head><meta charset="utf-8"><title>${scenario.name} Mission Report</title></head>
        <body>
          <h1>${scenario.name}</h1>
          <p>${scenario.purpose}</p>
          <h2>Fleet Performance</h2>
          <ul>
            <li>Robots deployed: ${robots.length}</li>
            <li>Active robots: ${metrics.activeRobots}</li>
            <li>Queued tasks: ${metrics.queuedTasks}</li>
            <li>Completed tasks: ${metrics.completedTasks}</li>
            <li>Average battery: ${metrics.averageBatterySoc.toFixed(1)}%</li>
          </ul>
        </body>
      </html>`;
  }
}

