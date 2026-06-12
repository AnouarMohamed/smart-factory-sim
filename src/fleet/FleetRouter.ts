/**
 * Coordinates route cell reservations across robots.
 */

import type { CellReservation, RobotDigitalTwin } from '@types';
import type { NavGrid } from '@pathfinding/NavGrid';

export class FleetRouter {
  public constructor(private readonly grid: NavGrid) {}

  /** Reserve upcoming route cells for a robot. */
  public reserveRoute(robot: RobotDigitalTwin, timestamp: number): readonly CellReservation[] {
    this.grid.clearReservations(robot.id);
    const reservations = robot.path.slice(0, 12).map((cell, index): CellReservation => ({
      robotId: robot.id,
      cell,
      entersAtMs: timestamp + index * 500,
      leavesAtMs: timestamp + (index + 1) * 500
    }));
    for (const reservation of reservations) {
      this.grid.reserve(reservation);
    }
    return reservations;
  }
}

