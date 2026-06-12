/**
 * Articulated forklift arm mesh driven by servo angle.
 */

import * as THREE from 'three';

export class ForkliftArmMesh {
  public readonly group = new THREE.Group();
  private readonly lift = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.44, 0.04),
    new THREE.MeshStandardMaterial({ color: '#4FC3F7', emissive: '#08293a' })
  );

  public constructor() {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.05, 0.05),
      new THREE.MeshStandardMaterial({ color: '#8B9BB4', metalness: 0.5, roughness: 0.4 })
    );
    this.lift.position.set(0.12, 0, 0.04);
    this.group.add(base, this.lift);
    this.group.position.set(0.18, 0, 0.03);
  }

  /** Set arm angle in degrees. */
  public setAngle(angleDeg: number): void {
    this.group.rotation.y = (-angleDeg * Math.PI) / 360;
  }
}

