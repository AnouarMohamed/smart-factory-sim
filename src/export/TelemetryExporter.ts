/**
 * JSON exporter for robot telemetry time-series data.
 */

import type { RobotTelemetry } from '@types';

export class TelemetryExporter {
  /** Export telemetry records as formatted JSON. */
  public export(records: readonly RobotTelemetry[]): string {
    return JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2);
  }
}

