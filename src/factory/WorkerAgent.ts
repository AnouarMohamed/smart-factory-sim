/**
 * Autonomous worker agent with route following and safety bubble state.
 */

import { FACTORY_CONFIG } from '@config/factory.config';
import type { Vector2, WorkerEntity } from '@types';

export class WorkerAgent {
  private entity: WorkerEntity;

  public constructor(entity: WorkerEntity) {
    this.entity = entity;
  }

  /** Advance worker along its route. */
  public step(deltaSeconds: number): WorkerEntity {
    const target = this.entity.route[this.entity.routeIndex];
    if (!target) {
      return this.entity;
    }

    const dx = target.x - this.entity.position.x;
    const dy = target.y - this.entity.position.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 0.05) {
      this.entity = {
        ...this.entity,
        routeIndex: (this.entity.routeIndex + 1) % Math.max(1, this.entity.route.length),
        state: 'AT_STATION'
      };
      return this.entity;
    }

    const step = Math.min(distance, FACTORY_CONFIG.workerSpeedMps * deltaSeconds);
    const nextPosition: Vector2 = {
      x: this.entity.position.x + (dx / distance) * step,
      y: this.entity.position.y + (dy / distance) * step
    };
    this.entity = { ...this.entity, position: nextPosition, state: 'WALKING_TO_NEXT' };
    return this.entity;
  }

  /** Return true when a robot position is inside the worker safety bubble. */
  public isRobotTooClose(robotPosition: Vector2): boolean {
    const distance = Math.hypot(robotPosition.x - this.entity.position.x, robotPosition.y - this.entity.position.y);
    return distance <= this.entity.safetyBubbleM;
  }

  /** Return worker state. */
  public snapshot(): WorkerEntity {
    return this.entity;
  }
}

