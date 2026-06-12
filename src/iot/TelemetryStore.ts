/**
 * Queryable in-memory time-series store for telemetry and MQTT messages.
 */

import type { MQTTMessage, RobotTelemetry } from '@types';

export class TelemetryStore {
  private readonly telemetry = new Map<string, RobotTelemetry[]>();
  private readonly mqttMessages: MQTTMessage[] = [];

  /** Append robot telemetry to the store. */
  public appendTelemetry(telemetry: RobotTelemetry): void {
    const series = this.telemetry.get(telemetry.robotId) ?? [];
    series.push(telemetry);
    this.telemetry.set(telemetry.robotId, series.slice(-1000));
  }

  /** Append MQTT message to the store. */
  public appendMessage(message: MQTTMessage): void {
    this.mqttMessages.push(message);
    if (this.mqttMessages.length > 2000) {
      this.mqttMessages.shift();
    }
  }

  /** Query telemetry for one robot. */
  public queryRobot(robotId: string, limit: number): readonly RobotTelemetry[] {
    return (this.telemetry.get(robotId) ?? []).slice(-limit);
  }
}

