/**
 * Articulated forklift arm mesh driven by servo angle.
 */

import * as THREE from 'three';

export class ForkliftArmMesh {
  public readonly group = new THREE.Group();
  private readonly lift = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.045, 0.08),
    new THREE.MeshStandardMaterial({ color: '#4FC3F7', emissive: '#08293a' })
  );

  public constructor() {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.12, 0.36),
      new THREE.MeshStandardMaterial({ color: '#8B9BB4', metalness: 0.5, roughness: 0.4 })
    );
    base.position.set(0.42, 0.2, 0);
    this.lift.position.set(0.72, 0.13, 0);
    this.group.add(base, this.lift);
    this.group.position.set(0.12, 0, 0);
  }

  /** Set arm angle in degrees. */
  public setAngle(angleDeg: number): void {
    this.lift.rotation.z = (angleDeg * Math.PI) / 420;
  }
}
