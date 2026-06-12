/**
 * Sensor panel renderer for ultrasonic, IR array, encoder, and IMU data.
 */

import type { RobotDigitalTwin } from '@types';

export class SensorPanel {
  /** Render sensor telemetry. */
  public render(twin: RobotDigitalTwin | null): string {
    if (!twin) {
      return '<section class="panel"><h2>Sensors</h2><p class="empty">No sensor data</p></section>';
    }

    return `<section class="panel">
      <h2>Sensors</h2>
      <div class="sensor-bars">
        ${twin.sensors.irArray.readings
          .map((reading) => `<i style="height:${Math.max(8, (1 - reading) * 42).toFixed(0)}px"></i>`)
          .join('')}
      </div>
      <div class="metric-grid compact">
        <div><span>Ultrasonic</span><strong>${twin.sensors.ultrasonic.distanceM.toFixed(2)} m</strong></div>
        <div><span>Line error</span><strong>${twin.sensors.irArray.lineError.toFixed(2)}</strong></div>
        <div><span>Encoder L</span><strong>${twin.sensors.encoder.leftTicks}</strong></div>
        <div><span>Encoder R</span><strong>${twin.sensors.encoder.rightTicks}</strong></div>
      </div>
    </section>`;
  }
}

