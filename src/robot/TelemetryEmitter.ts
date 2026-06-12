/**
 * Packages robot digital twin snapshots into MQTT telemetry payloads.
 */

import type { RobotDigitalTwin, RobotTelemetry } from '@types';

export class TelemetryEmitter {
  /** Build robot telemetry from a digital twin snapshot. */
  public toTelemetry(twin: RobotDigitalTwin): RobotTelemetry {
    return {
      robotId: twin.id,
      timestamp: twin.timestamp,
      pose: twin.pose,
      state: twin.state.kind,
      speedMps: twin.velocity.linear,
      batterySoc: twin.battery.soc,
      payloadId: twin.payload?.id ?? null
    };
  }
}

