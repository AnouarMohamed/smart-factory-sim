/**
 * Simulated cloud telemetry sink for AWS IoT Core or Azure IoT Hub style ingestion.
 */

import type { MQTTMessage } from '@types';

export class CloudConnector {
  private readonly ingested: MQTTMessage[] = [];

  /** Ingest a broker message into the simulated cloud sink. */
  public ingest(message: MQTTMessage): void {
    this.ingested.push(message);
    if (this.ingested.length > 500) {
      this.ingested.shift();
    }
  }

  /** Return count of ingested messages. */
  public count(): number {
    return this.ingested.length;
  }
}

