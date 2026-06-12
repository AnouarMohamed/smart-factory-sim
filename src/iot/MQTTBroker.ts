/**
 * In-browser MQTT broker simulation with subscriptions, retained messages, QoS metadata, and LWT.
 */

import { MQTT_CONFIG } from '@config/mqtt.config';
import type { EventBus } from '@core/EventBus';
import type { LastWill, MQTTClientConnection, MQTTMessage, MQTTSubscription, QoSLevel } from '@types';
import { LastWillManager } from './LastWillManager';
import { TopicRouter } from './TopicRouter';

export type MQTTMessageHandler = (message: MQTTMessage) => void;

interface SubscriptionRecord extends MQTTSubscription {
  readonly handler: MQTTMessageHandler;
}

export class MQTTBroker {
  private readonly router = new TopicRouter();
  private readonly willManager = new LastWillManager();
  private readonly clients = new Map<string, MQTTClientConnection>();
  private readonly subscriptions: SubscriptionRecord[] = [];
  private readonly retained = new Map<string, MQTTMessage>();
  private readonly messages: MQTTMessage[] = [];

  public constructor(private readonly eventBus: EventBus) {}

  /** Connect a client to the broker. */
  public connect(clientId: string, will: LastWill | null = null): MQTTClientConnection {
    const connection: MQTTClientConnection = {
      clientId,
      connected: true,
      lastSeen: Date.now(),
      will
    };
    this.clients.set(clientId, connection);
    this.willManager.register(clientId, will);
    return connection;
  }

  /** Disconnect a client and publish LWT when the disconnect is unclean. */
  public disconnect(clientId: string, wasClean: boolean): void {
    const connection = this.clients.get(clientId);
    if (!connection) {
      return;
    }

    this.clients.set(clientId, { ...connection, connected: false, lastSeen: Date.now() });
    this.eventBus.emit('mqtt:client-disconnected', { clientId, wasClean });

    if (!wasClean) {
      const will = this.willManager.consume(clientId);
      if (will) {
        this.publish(clientId, will.topic, will.payload, will.qos, will.retained);
      }
    }
  }

  /** Subscribe a client to a topic filter. */
  public subscribe(clientId: string, topicFilter: string, qos: QoSLevel, handler: MQTTMessageHandler): void {
    this.subscriptions.push({ clientId, topicFilter, qos, handler });
    for (const message of this.retained.values()) {
      if (this.router.matches(topicFilter, message.topic)) {
        handler(message);
      }
    }
  }

  /** Publish a message to subscribers and retained storage. */
  public publish<TPayload>(
    publisherId: string,
    topic: string,
    payload: TPayload,
    qos: QoSLevel,
    retained: boolean
  ): MQTTMessage<TPayload> {
    const message: MQTTMessage<TPayload> = {
      topic,
      payload,
      qos,
      retained,
      timestamp: Date.now(),
      publisherId
    };

    this.messages.push(message);
    if (this.messages.length > MQTT_CONFIG.maxMessagesStored) {
      this.messages.shift();
    }

    if (retained) {
      this.retained.set(topic, message);
    }

    for (const subscription of this.subscriptions) {
      if (this.router.matches(subscription.topicFilter, topic)) {
        subscription.handler(message);
      }
    }

    this.eventBus.emit('mqtt:message-published', message);
    return message;
  }

  /** Return recent broker messages. */
  public recentMessages(limit: number): readonly MQTTMessage[] {
    return this.messages.slice(-limit);
  }
}

