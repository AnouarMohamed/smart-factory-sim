/**
 * Animated wheel mesh with tire geometry.
 */

import * as THREE from 'three';

export class WheelMesh {
  public readonly mesh: THREE.Mesh;

  public constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.045, 24),
      new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.72 })
    );
    this.mesh.rotation.z = Math.PI / 2;
  }

  /** Rotate wheel based on RPM and elapsed seconds. */
  public spin(rpm: number, deltaSeconds: number): void {
    this.mesh.rotation.x += (rpm / 60) * Math.PI * 2 * deltaSeconds;
  }
}

