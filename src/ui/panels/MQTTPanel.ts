/**
 * MQTT panel renderer for live broker messages.
 */

import type { MQTTMessage } from '@types';

export class MQTTPanel {
  /** Render the latest MQTT messages. */
  public render(messages: readonly MQTTMessage[]): string {
    return `<section class="panel tall">
      <h2>MQTT</h2>
      <div class="feed">
        ${messages
          .slice(-12)
          .reverse()
          .map(
            (message) =>
              `<div><span>${message.qos}</span><code>${message.topic}</code><time>${new Date(message.timestamp).toLocaleTimeString()}</time></div>`
          )
          .join('')}
      </div>
    </section>`;
  }
}

