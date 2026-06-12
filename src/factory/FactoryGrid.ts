/**
 * Tile-based factory occupancy grid with zone metadata.
 */

import type { GridCell, ScenarioDefinition, Vector2 } from '@types';
import { NavGrid } from '@pathfinding/NavGrid';

export class FactoryGrid {
  private readonly navGrid: NavGrid;

  public constructor(scenario: ScenarioDefinition) {
    this.navGrid = NavGrid.fromScenario(scenario);
  }

  /** Return the cell at a factory grid position. */
  public cellAt(position: Vector2): GridCell | null {
    return this.navGrid.cellAt(position);
  }

  /** Return true when a position is blocked. */
  public isBlocked(position: Vector2): boolean {
    return this.cellAt(position)?.blocked ?? true;
  }

  /** Return the navigation grid backing this factory grid. */
  public navigation(): NavGrid {
    return this.navGrid;
  }
}

