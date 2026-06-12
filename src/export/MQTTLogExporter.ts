/**
 * CSV exporter for MQTT broker message logs.
 */

import type { MQTTMessage } from '@types';

export class MQTTLogExporter {
  /** Export MQTT messages as CSV. */
  public export(messages: readonly MQTTMessage[]): string {
    const header = 'timestamp,topic,qos,retained,publisherId';
    const rows = messages.map((message) =>
      [
        message.timestamp,
        `"${message.topic.replaceAll('"', '""')}"`,
        message.qos,
        message.retained,
        `"${message.publisherId.replaceAll('"', '""')}"`
      ].join(',')
    );
    return [header, ...rows].join('\n');
  }
}

