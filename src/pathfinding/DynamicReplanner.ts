/**
 * Obstacle-aware path replan service.
 */

import type { Vector2 } from '@types';
import type { AStarPlanner} from './AStarPlanner';
import { type PathPlan } from './AStarPlanner';

export class DynamicReplanner {
  public constructor(private readonly planner: AStarPlanner) {}

  /** Replan from the robot current position to a destination. */
  public replan(currentPosition: Vector2, destination: Vector2): PathPlan {
    return this.planner.plan(currentPosition, destination);
  }
}

