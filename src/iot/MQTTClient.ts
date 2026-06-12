/**
 * Simulated MQTT client facade for modules that publish or subscribe through the broker.
 */

import type { LastWill, MQTTMessage, QoSLevel } from '@types';
import type { MQTTBroker} from './MQTTBroker';
import { type MQTTMessageHandler } from './MQTTBroker';

export class MQTTClient {
  public constructor(
    public readonly clientId: string,
    private readonly broker: MQTTBroker,
    will: LastWill | null = null
  ) {
    this.broker.connect(clientId, will);
  }

  /** Publish a message through the broker. */
  public publish<TPayload>(
    topic: string,
    payload: TPayload,
    qos: QoSLevel,
    retained: boolean
  ): MQTTMessage<TPayload> {
    return this.broker.publish(this.clientId, topic, payload, qos, retained);
  }

  /** Subscribe to a broker topic filter. */
  public subscribe(topicFilter: string, qos: QoSLevel, handler: MQTTMessageHandler): void {
    this.broker.subscribe(this.clientId, topicFilter, qos, handler);
  }

  /** Disconnect the client. */
  public disconnect(wasClean: boolean): void {
    this.broker.disconnect(this.clientId, wasClean);
  }
}

