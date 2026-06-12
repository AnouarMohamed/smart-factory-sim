/**
 * Path smoothing helper for reducing grid stair-step motion.
 */

import type { Vector2 } from '@types';

export class PathSmoother {
  /** Smooth a path by removing nearly collinear interior points. */
  public smooth(path: readonly Vector2[]): readonly Vector2[] {
    if (path.length <= 2) {
      return path;
    }

    const smoothed: Vector2[] = [path[0]];
    for (let index = 1; index < path.length - 1; index += 1) {
      const previous = smoothed[smoothed.length - 1];
      const current = path[index];
      const next = path[index + 1];
      const area = Math.abs(
        previous.x * (current.y - next.y) +
          current.x * (next.y - previous.y) +
          next.x * (previous.y - current.y)
      );
      if (area > 0.01) {
        smoothed.push(current);
      }
    }
    smoothed.push(path[path.length - 1]);
    return smoothed;
  }
}

