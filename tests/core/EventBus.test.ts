import { describe, expect, it } from 'vitest';
import { EventBus } from '@core/EventBus';

describe('EventBus', () => {
  it('emits typed events to subscribers', () => {
    const bus = new EventBus();
    let level = 0;
    bus.on('robot:battery-low', (event) => {
      level = event.level;
    });

    bus.emit('robot:battery-low', { robotId: 'r1', level: 12 });

    expect(level).toBe(12);
  });

  it('unsubscribes listeners', () => {
    const bus = new EventBus();
    let count = 0;
    const unsubscribe = bus.on('ui:panel-opened', () => {
      count += 1;
    });

    unsubscribe();
    bus.emit('ui:panel-opened', { panelId: 'mqtt' });

    expect(count).toBe(0);
  });
});

