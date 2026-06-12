/**
 * Current path line, waypoint marker, and A* frontier visualization.
 */

import type { Vector2 } from '@types';
import * as THREE from 'three';

export class PathVisualization {
  public readonly group = new THREE.Group();
  private line: THREE.Line | null = null;

  public constructor(private readonly color = '#00D4FF') {}

  /** Render a route path as a cyan line. */
  public setPath(path: readonly Vector2[]): void {
    if (this.line) {
      this.group.remove(this.line);
    }

    const points = path.map((point) => new THREE.Vector3(point.x, 0.04, point.y));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: this.color, transparent: true, opacity: 0.78 })
    );
    this.group.add(this.line);
  }
}
