/**
 * Waypoint editor model for click-to-place routes.
 */

import type { Vector2 } from '@types';

export class WaypointEditor {
  private readonly waypoints: Vector2[] = [];

  /** Add a waypoint. */
  public add(point: Vector2): void {
    this.waypoints.push(point);
  }

  /** Return current waypoints. */
  public all(): readonly Vector2[] {
    return this.waypoints;
  }
}

