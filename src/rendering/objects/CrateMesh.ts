/**
 * Cargo crate mesh with industrial amber material.
 */

import * as THREE from 'three';

export class CrateMesh {
  public readonly mesh: THREE.Mesh;

  public constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.2, 0.28),
      new THREE.MeshStandardMaterial({ color: '#FFB300', roughness: 0.6 })
    );
  }
}

