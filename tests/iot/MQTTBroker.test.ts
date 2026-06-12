import { describe, expect, it } from 'vitest';
import { EventBus } from '@core/EventBus';
import { MQTTBroker } from '@iot/MQTTBroker';

describe('MQTTBroker', () => {
  it('publishes retained messages to late subscribers', () => {
    const broker = new MQTTBroker(new EventBus());
    broker.connect('publisher');
    broker.connect('subscriber');
    broker.publish('publisher', 'factory/robots/r1/state', { state: 'IDLE' }, 1, true);

    let received = 0;
    broker.subscribe('subscriber', 'factory/robots/+/state', 1, () => {
      received += 1;
    });

    expect(received).toBe(1);
  });
});

