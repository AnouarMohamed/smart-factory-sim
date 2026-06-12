/**
 * Accumulates robot positions into a normalized floor heatmap grid.
 */

import type { Vector2 } from '@types';

export class HeatmapAccumulator {
  private readonly values: number[];

  public constructor(
    private readonly width: number,
    private readonly height: number
  ) {
    this.values = Array.from({ length: width * height }, () => 0);
  }

  /** Add heat to the cell containing a robot position. */
  public add(position: Vector2, amount: number): void {
    const x = Math.round(position.x);
    const y = Math.round(position.y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }

    this.values[y * this.width + x] += amount;
  }

  /** Return a normalized heat value for a cell. */
  public valueAt(x: number, y: number): number {
    const max = Math.max(1, ...this.values);
    return this.values[y * this.width + x] / max;
  }
}

