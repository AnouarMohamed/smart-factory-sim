import { describe, expect, it } from 'vitest';
import { EventBus } from '@core/EventBus';
import { RobotController } from '@robot/RobotController';
import type { Task } from '@types';

describe('RobotController', () => {
  it('does not snap to distant mission targets on a timer', () => {
    const robot = new RobotController('robot-1', { x: 0, y: 0, theta: 0 }, new EventBus());
    const task: Task = {
      id: 'long-route',
      priority: 'NORMAL',
      pickup: { x: 12, y: 0 },
      dropoff: { x: 14, y: 0 },
      payload: {
        id: 'crate-1',
        itemId: 'merchandise',
        weightKg: 1,
        dimensionsM: { width: 0.3, depth: 0.3, height: 0.2 }
      },
      createdAtMs: 0
    };

    robot.assignMission(
      task,
      [
        { x: 0, y: 0 },
        { x: 12, y: 0 }
      ],
      [
        { x: 12, y: 0 },
        { x: 14, y: 0 }
      ],
      [
        { x: 14, y: 0 },
        { x: 16, y: 0 }
      ],
      0
    );

    let twin = robot.twin();
    for (let timestamp = 100; timestamp <= 4000; timestamp += 100) {
      twin = robot.step(100, timestamp);
    }

    expect(twin.state.kind).toBe('NAVIGATING');
    expect(twin.pose.x).toBeLessThan(6);
    expect(twin.payload).toBeNull();
  });
});
