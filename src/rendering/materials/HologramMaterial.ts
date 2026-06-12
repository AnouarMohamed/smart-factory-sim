/**
 * Digital twin hologram wireframe material helpers.
 */

import * as THREE from 'three';

export class HologramMaterial {
  /** Create cyan emissive wireframe material. */
  public create(): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00D4FF'),
      wireframe: true,
      transparent: true,
      opacity: 0.42
    });
  }
}

