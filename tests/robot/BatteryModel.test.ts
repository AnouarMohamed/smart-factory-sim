import { describe, expect, it } from 'vitest';
import { BatteryModel } from '@robot/BatteryModel';

describe('BatteryModel', () => {
  it('discharges under load', () => {
    const battery = new BatteryModel();
    const before = battery.snapshot().soc;
    const after = battery.discharge(10, 1).soc;

    expect(after).toBeLessThan(before);
  });
});

