/**
 * Lightweight particle pool placeholder for sparks and motion dust.
 */

import * as THREE from 'three';

export class ParticleSystem {
  public readonly group = new THREE.Group();

  /** Emit a small point marker at a location. */
  public emit(position: THREE.Vector3, color: string): void {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 8, 8),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 })
    );
    particle.position.copy(position);
    this.group.add(particle);
    if (this.group.children.length > 80) {
      const oldest = this.group.children[0];
      this.group.remove(oldest);
    }
  }
}

