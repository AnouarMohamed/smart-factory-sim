/**
 * Subtle ambient dust particles for factory air volume.
 */

import * as THREE from 'three';

export class AmbientParticles {
  public readonly points: THREE.Points;

  public constructor(width: number, height: number) {
    const positions: number[] = [];
    for (let index = 0; index < 160; index += 1) {
      positions.push(Math.random() * width, Math.random() * 2.2 + 0.2, Math.random() * height);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ color: '#8B9BB4', size: 0.012, transparent: true, opacity: 0.26 })
    );
  }
}

