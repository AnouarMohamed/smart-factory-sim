import { describe, expect, it } from 'vitest';
import { AStarPlanner } from '@pathfinding/AStarPlanner';
import { NavGrid } from '@pathfinding/NavGrid';

describe('AStarPlanner', () => {
  it('finds a route on an open grid', () => {
    const planner = new AStarPlanner(new NavGrid(8, 8, 0.5));
    const plan = planner.plan({ x: 0, y: 0 }, { x: 7, y: 7 });

    expect(plan.found).toBe(true);
    expect(plan.path.length).toBeGreaterThan(1);
  });
});

