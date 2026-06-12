import { describe, expect, it } from 'vitest';
import { DeadlockResolver } from '@pathfinding/DeadlockResolver';

describe('DeadlockResolver', () => {
  it('detects circular waits', () => {
    const resolver = new DeadlockResolver();
    const result = resolver.resolve([
      { robotId: 'a', waitingForRobotId: 'b' },
      { robotId: 'b', waitingForRobotId: 'a' }
    ]);

    expect(result.deadlocked).toBe(true);
  });
});

