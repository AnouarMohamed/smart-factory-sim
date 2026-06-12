import { describe, expect, it } from 'vitest';
import { PIDController } from '@physics/PIDController';

describe('PIDController', () => {
  it('clamps output', () => {
    const pid = new PIDController({
      gains: { kp: 10, ki: 0, kd: 0 },
      outputLimits: { min: -1, max: 1 },
      derivativeFilter: 0
    });

    expect(pid.compute(10, 0, 0.1)).toBe(1);
  });

  it('resets terms', () => {
    const pid = new PIDController({
      gains: { kp: 1, ki: 1, kd: 1 },
      outputLimits: { min: -10, max: 10 },
      derivativeFilter: 0
    });

    pid.compute(1, 0, 0.1);
    pid.reset();

    expect(pid.getTerms().output).toBe(0);
  });
});

