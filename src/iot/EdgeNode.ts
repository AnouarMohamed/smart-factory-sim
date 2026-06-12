/**
 * Simulated edge node that preprocesses robot telemetry before cloud ingestion.
 */

import type { RobotTelemetry } from '@types';

export interface EdgeSummary {
  readonly robotId: string;
  readonly speedMps: number;
  readonly batterySoc: number;
  readonly alert: boolean;
}

export class EdgeNode {
  /** Reduce full telemetry into an edge summary. */
  public preprocess(telemetry: RobotTelemetry): EdgeSummary {
    return {
      robotId: telemetry.robotId,
      speedMps: telemetry.speedMps,
      batterySoc: telemetry.batterySoc,
      alert: telemetry.batterySoc < 20
    };
  }
}

