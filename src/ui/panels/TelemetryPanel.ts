/**
 * Telemetry panel renderer for robot pose, velocity, battery, and payload.
 */

import type { RobotDigitalTwin } from '@types';

export class TelemetryPanel {
  /** Render telemetry for the selected robot. */
  public render(twin: RobotDigitalTwin | null): string {
    if (!twin) {
      return '<section class="panel"><h2>Telemetry</h2><p class="empty">No robot online</p></section>';
    }

    return `<section class="panel">
      <h2>Telemetry</h2>
      <div class="metric-grid">
        <div><span>Robot</span><strong>${twin.id}</strong></div>
        <div><span>State</span><strong>${twin.state.kind}</strong></div>
        <div><span>Speed</span><strong>${twin.velocity.linear.toFixed(2)} m/s</strong></div>
        <div><span>Heading</span><strong>${twin.pose.theta.toFixed(2)} rad</strong></div>
        <div><span>Battery</span><strong>${twin.battery.soc.toFixed(1)}%</strong></div>
        <div><span>ETA</span><strong>${(twin.eta ?? 0).toFixed(1)} s</strong></div>
      </div>
    </section>`;
  }
}

