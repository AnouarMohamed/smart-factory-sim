/**
 * Motion trail line effect behind active robots.
 */

import type { Vector2 } from '@types';
import * as THREE from 'three';

export class TrailEffect {
  public readonly group = new THREE.Group();
  private readonly points: Vector2[] = [];

  /** Add a trail point and rebuild the line. */
  public add(point: Vector2): void {
    this.points.push(point);
    if (this.points.length > 40) {
      this.points.shift();
    }
  }
}

