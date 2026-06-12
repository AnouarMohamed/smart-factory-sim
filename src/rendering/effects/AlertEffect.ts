/**
 * Pulsing incident ring effect.
 */

import * as THREE from 'three';

export class AlertEffect {
  public readonly mesh: THREE.Mesh;

  public constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.45, 48),
      new THREE.MeshBasicMaterial({ color: '#FF3B30', transparent: true, opacity: 0.6 })
    );
    this.mesh.rotation.x = -Math.PI / 2;
  }

  /** Update alert ring scale from time. */
  public update(timestamp: number): void {
    const scale = 1 + Math.sin(timestamp / 120) * 0.12;
    this.mesh.scale.setScalar(scale);
  }
}

