/**
 * Animated wheel mesh with tire geometry.
 */

import * as THREE from 'three';

export class WheelMesh {
  public readonly mesh: THREE.Mesh;

  public constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.1, 28),
      new THREE.MeshStandardMaterial({ color: '#141820', roughness: 0.72 })
    );
    this.mesh.rotation.x = Math.PI / 2;
  }

  /** Rotate wheel based on RPM and elapsed seconds. */
  public spin(rpm: number, deltaSeconds: number): void {
    this.mesh.rotation.z += (rpm / 60) * Math.PI * 2 * deltaSeconds;
  }
}
