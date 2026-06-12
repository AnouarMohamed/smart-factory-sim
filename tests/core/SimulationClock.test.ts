import { describe, expect, it } from 'vitest';
import { SimulationClock } from '@core/SimulationClock';

describe('SimulationClock', () => {
  it('scales simulated time', () => {
    const clock = new SimulationClock(2);

    clock.step(100);

    expect(clock.now()).toBe(200);
  });

  it('pauses and resumes time', () => {
    const clock = new SimulationClock(1);
    clock.pause();

    clock.step(100);
    clock.resume();
    clock.step(50);

    expect(clock.now()).toBe(50);
  });
});

