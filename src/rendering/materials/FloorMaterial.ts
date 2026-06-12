/**
 * Procedural industrial floor material helpers.
 */

import * as THREE from 'three';

export class FloorMaterial {
  /** Create dark epoxy floor material. */
  public create(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1C1C2E'),
      roughness: 0.62,
      metalness: 0.08
    });
  }

  /** Create subtle grid line material. */
  public grid(): THREE.LineBasicMaterial {
    return new THREE.LineBasicMaterial({
      color: new THREE.Color('#1A2035'),
      transparent: true,
      opacity: 0.55
    });
  }
}

