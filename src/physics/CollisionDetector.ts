/**
 * Collision checks for grid obstacles, workers, and robot safety bubbles.
 */

import type { AABB, Circle, Vector2 } from '@types';

export class CollisionDetector {
  /** Return true when two axis-aligned boxes overlap. */
  public intersectsAABB(a: AABB, b: AABB): boolean {
    return a.min.x <= b.max.x && a.max.x >= b.min.x && a.min.y <= b.max.y && a.max.y >= b.min.y;
  }

  /** Return true when two circles overlap. */
  public intersectsCircle(a: Circle, b: Circle): boolean {
    const distance = Math.hypot(a.center.x - b.center.x, a.center.y - b.center.y);
    return distance <= a.radius + b.radius;
  }

  /** Return true when a point lies inside an axis-aligned box. */
  public pointInAABB(point: Vector2, box: AABB): boolean {
    return point.x >= box.min.x && point.x <= box.max.x && point.y >= box.min.y && point.y <= box.max.y;
  }

  /** Return minimum distance from a point to a line segment. */
  public distanceToSegment(point: Vector2, start: Vector2, end: Vector2): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0) {
      return Math.hypot(point.x - start.x, point.y - start.y);
    }

    const t = Math.max(
      0,
      Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared)
    );
    const projection = { x: start.x + t * dx, y: start.y + t * dy };
    return Math.hypot(point.x - projection.x, point.y - projection.y);
  }
}

