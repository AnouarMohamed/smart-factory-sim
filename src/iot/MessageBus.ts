/**
 * Live MQTT message feed model for the dashboard panel.
 */

import type { MQTTMessage } from '@types';

export class MessageBus {
  private readonly messages: MQTTMessage[] = [];

  /** Append a message to the feed. */
  public push(message: MQTTMessage): void {
    this.messages.push(message);
    if (this.messages.length > 200) {
      this.messages.shift();
    }
  }

  /** Return recent messages, optionally filtered by substring. */
  public recent(limit: number, filter = ''): readonly MQTTMessage[] {
    const filtered = filter
      ? this.messages.filter((message) => message.topic.includes(filter))
      : this.messages;
    return filtered.slice(-limit);
  }
}

