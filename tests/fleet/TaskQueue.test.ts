import { describe, expect, it } from 'vitest';
import { TaskQueue } from '@fleet/TaskQueue';
import type { Task } from '@types';

const makeTask = (id: string, priority: Task['priority']): Task => ({
  id,
  priority,
  pickup: { x: 0, y: 0 },
  dropoff: { x: 1, y: 1 },
  payload: {
    id: `${id}-payload`,
    itemId: 'part',
    weightKg: 1,
    dimensionsM: { width: 0.1, depth: 0.1, height: 0.1 }
  },
  createdAtMs: 0
});

describe('TaskQueue', () => {
  it('orders critical tasks first', () => {
    const queue = new TaskQueue();
    queue.enqueue(makeTask('low', 'LOW'));
    queue.enqueue(makeTask('critical', 'CRITICAL'));

    expect(queue.peek()?.id).toBe('critical');
  });
});

