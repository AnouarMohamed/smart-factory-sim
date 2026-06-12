/**
 * Holographic digital twin overlay rendered above the physical robot mesh.
 */

import * as THREE from 'three';
import { HologramMaterial } from '../materials/HologramMaterial';

export class DigitalTwinOverlay {
  public readonly mesh: THREE.Mesh;

  public constructor() {
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.28), new HologramMaterial().create());
    this.mesh.position.y = 0.28;
  }
}

