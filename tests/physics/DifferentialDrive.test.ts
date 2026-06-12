import { describe, expect, it } from 'vitest';
import { DifferentialDrive } from '@physics/DifferentialDrive';

describe('DifferentialDrive', () => {
  it('moves forward with equal wheel speeds', () => {
    const drive = new DifferentialDrive();
    const result = drive.integrate(
      { x: 0, y: 0, theta: 0 },
      { leftRadPerSec: 10, rightRadPerSec: 10 },
      0.1,
      1
    );

    expect(result.pose.x).toBeGreaterThan(0);
    expect(Math.abs(result.angularVelocity)).toBeLessThan(0.001);
  });
});

