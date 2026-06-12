/**
 * Weighted A* planner with octile heuristic and expansion trace capture.
 */

import type { GridCell, Vector2 } from '@types';
import type { NavGrid } from './NavGrid';

export interface PathPlan {
  readonly found: boolean;
  readonly path: readonly Vector2[];
  readonly expanded: readonly Vector2[];
  readonly cost: number;
  readonly durationMs: number;
}

interface QueueNode {
  readonly cell: GridCell;
  readonly fScore: number;
}

export class AStarPlanner {
  public constructor(private readonly grid: NavGrid) {}

  /** Plan a path from start to goal with weighted cells and diagonal movement. */
  public plan(start: Vector2, goal: Vector2): PathPlan {
    const startedAt = performance.now();
    const startCell = this.grid.cellAt(start);
    const goalCell = this.grid.cellAt(goal);

    if (!startCell || !goalCell || startCell.blocked || goalCell.blocked) {
      return this.emptyPlan(startedAt);
    }

    const open: QueueNode[] = [{ cell: startCell, fScore: this.heuristic(startCell, goalCell) }];
    const cameFrom = new Map<string, string>();
    const cellByKey = new Map<string, GridCell>([[this.grid.key(startCell), startCell]]);
    const gScore = new Map<string, number>([[this.grid.key(startCell), 0]]);
    const expanded: Vector2[] = [];

    while (open.length > 0) {
      open.sort((a, b) => a.fScore - b.fScore || this.tieBreak(a.cell, goalCell) - this.tieBreak(b.cell, goalCell));
      const current = open.shift();
      if (!current) {
        break;
      }

      const currentKey = this.grid.key(current.cell);
      expanded.push({ x: current.cell.x, y: current.cell.y });

      if (current.cell.x === goalCell.x && current.cell.y === goalCell.y) {
        return {
          found: true,
          path: this.reconstruct(cameFrom, cellByKey, currentKey),
          expanded,
          cost: gScore.get(currentKey) ?? 0,
          durationMs: performance.now() - startedAt
        };
      }

      for (const neighbor of this.grid.neighbors(current.cell)) {
        const neighborKey = this.grid.key(neighbor);
        cellByKey.set(neighborKey, neighbor);
        const diagonalCost = neighbor.x !== current.cell.x && neighbor.y !== current.cell.y ? Math.SQRT2 : 1;
        const tentative = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + diagonalCost * this.grid.cost(neighbor);

        if (tentative < (gScore.get(neighborKey) ?? Number.POSITIVE_INFINITY)) {
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentative);
          const fScore = tentative + this.heuristic(neighbor, goalCell);
          const existing = open.find((node) => this.grid.key(node.cell) === neighborKey);
          if (!existing) {
            open.push({ cell: neighbor, fScore });
          }
        }
      }
    }

    return this.emptyPlan(startedAt, expanded);
  }

  private emptyPlan(startedAt: number, expanded: readonly Vector2[] = []): PathPlan {
    return {
      found: false,
      path: [],
      expanded,
      cost: Number.POSITIVE_INFINITY,
      durationMs: performance.now() - startedAt
    };
  }

  private heuristic(a: Vector2, b: Vector2): number {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  }

  private tieBreak(a: Vector2, b: Vector2): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private reconstruct(
    cameFrom: ReadonlyMap<string, string>,
    cellByKey: ReadonlyMap<string, GridCell>,
    currentKey: string
  ): readonly Vector2[] {
    const keys = [currentKey];
    let cursor = currentKey;

    while (cameFrom.has(cursor)) {
      const previous = cameFrom.get(cursor);
      if (!previous) {
        break;
      }
      keys.push(previous);
      cursor = previous;
    }

    return keys
      .reverse()
      .map((key) => cellByKey.get(key))
      .filter((cell): cell is GridCell => cell !== undefined)
      .map((cell) => ({ x: cell.x, y: cell.y }));
  }
}

