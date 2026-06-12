/**
 * Maintenance panel renderer for component health.
 */

import type { RobotDigitalTwin } from '@types';

export class MaintenancePanel {
  /** Render maintenance telemetry. */
  public render(twin: RobotDigitalTwin | null): string {
    return `<section class="panel">
      <h2>Maintenance</h2>
      <div class="metric-grid compact">
        <div><span>Motor h</span><strong>${(twin?.maintenance.motorHours ?? 0).toFixed(3)}</strong></div>
        <div><span>Lift cycles</span><strong>${twin?.maintenance.liftCycles ?? 0}</strong></div>
        <div><span>Bearing</span><strong>${(twin?.maintenance.bearingWear ?? 0).toFixed(2)}%</strong></div>
        <div><span>Health</span><strong>${(twin?.battery.health ?? 100).toFixed(1)}%</strong></div>
      </div>
    </section>`;
  }
}

